
// Import Angular core modules: Component decorator, OnInit lifecycle interface, and ChangeDetectorRef for manual change detection
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Import CommonModule and FormsModule to use common Angular directives and template-driven forms features
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Import DomSanitizer and SafeHtml to safely render HTML content in Angular templates without security risks
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// Import HttpClient for making HTTP requests to the backend API
import { HttpClient } from '@angular/common/http';
// Import ViewEncapsulation to control CSS style encapsulation behavior
import { ViewEncapsulation } from '@angular/core';

// Declare jQuery globally so we can use Summernote jQuery plugin inside this component
declare var $: any;

@Component({
  selector: 'app-plan-documents',           // The HTML tag used to insert this component in templates: <app-plan-documents>
  standalone: true,                         // This component is standalone (not declared inside any Angular module)
  imports: [CommonModule, FormsModule],    // Import CommonModule and FormsModule for this standalone component
  templateUrl: './plan-documents.component.html',   // Path to the component's HTML template
  styleUrls: ['./plan-documents.component.css'],     // Path to the component's CSS stylesheet
  encapsulation: ViewEncapsulation.None    // Disable CSS encapsulation, so styles apply globally instead of only this component
})

export class PlanDocumentsComponent implements OnInit {
  // Store the content of Summernote editor as a string, initialize from localStorage if present
  content: string = localStorage.getItem('planDocumentsContent') || '';
  // Store sanitized HTML version of content for safe rendering in template
  safeHtml: SafeHtml;
  // Keep track of previously existing PDF links in the editor content (to detect deletions)
  previousPdfLinks: string[] = [];

  constructor(
    private sanitizer: DomSanitizer,       // Inject DomSanitizer service to sanitize HTML content
    private cdr: ChangeDetectorRef,        // Inject ChangeDetectorRef to trigger manual Angular change detection
    private http: HttpClient                // Inject HttpClient to communicate with backend API
  ) {
    // Sanitize the initial content and store in safeHtml variable
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.content);
  }

  ngOnInit(): void {
    // Store reference to 'this' for use inside jQuery callbacks
    const _this = this;

    // Extract all existing PDF links from the initial content to track for deletions later
    this.previousPdfLinks = this.extractPdfLinks(this.content);

    // Initialize Summernote editor on the element with id #summernote-plan using jQuery
    ($('#summernote-plan') as any).summernote({
      placeholder: 'Enter plan document details...',   // Placeholder text inside the editor
      tabsize: 2,              // Tab key inserts 2 spaces
      height: 300,             // Editor height in pixels
      fontSizes: ['8', '10', '12', '14', '16', '18', '24', '36'],  // Allowed font sizes
      toolbar: [               // Toolbar configuration: which buttons to show
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'clear', 'fontsize']],
        ['fontname', ['fontname']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'attachPdf']],  // Added custom "Attach PDF" button here
        ['view', ['fullscreen', 'codeview']],
        ['misc', ['undo', 'redo']]
      ],
      buttons: {
        // Define the custom "Attach PDF" button
        attachPdf: function () {
          // Create a Summernote UI button with icon and label
          const button = $.summernote.ui.button({
            contents: '<i class="note-icon-paperclip"></i> Attach PDF',  // Icon + text inside the button
            tooltip: 'Attach PDF',   // Tooltip text on hover
            click: function () {
              // Create a hidden file input element to select PDFs
              const input = $('<input type="file" accept="application/pdf" style="display:none" />');
              input.trigger('click');  // Programmatically open the file selection dialog

              // When a file is selected
              input.on('change', function (e: any) {
                const file = e.target.files[0];  // Get the first selected file
                if (file) {
                  // Create FormData to send file in POST request
                  const formData = new FormData();
                  formData.append('pdf', file);

                  // POST request to backend to upload the PDF file
                  _this.http.post('http://localhost:3000/upload', formData).subscribe(
                    (data: any) => {
                      // Construct the full URL for the uploaded PDF file
                      const fileUrl = 'http://localhost:3000' + data.filePath;
                      // Get currently selected text in Summernote editor, fallback to file name
                      const selectedText = ($('#summernote-plan') as any).summernote('getSelectedText');
                      const linkText = selectedText || file.name;
                      // Create anchor tag HTML for the PDF link
                      const anchorTag = `<a href="${fileUrl}" target="_blank">${linkText}</a>`;
                      // Focus the editor and insert the anchor tag HTML
                      ($('#summernote-plan') as any).summernote('focus');
                      ($('#summernote-plan') as any).summernote('pasteHTML', anchorTag);
                    },
                    (err) => {
                      // Handle upload error
                      console.error('❌ Upload failed:', err);
                      alert('❌ PDF upload failed.');
                    }
                  );
                }
              });
            }
          });
          return button.render();
        }
      },
      callbacks: {
        // Callback fired every time editor content changes
        onChange: (contents: string) => {
          // Extract all PDF links from new content
          const newLinks = _this.extractPdfLinks(contents);
          // Find which PDF links were deleted by comparing previous and new links
          const deletedLinks = _this.previousPdfLinks.filter(link => !newLinks.includes(link));

          // Notify backend about each deleted PDF so it can handle file removal or logging
          deletedLinks.forEach((deletedLink) => {
            // Extract file name from the URL
            const fileName = deletedLink.split('/').pop();
            _this.http.post('http://localhost:3000/delete-pdf', {
              fileName
            }).subscribe(
              () => console.log('🗑 Deleted PDF logged:', fileName),
              (err) => console.error('❌ Delete log failed:', err)
            );
          });

          // Update the list of previous PDF links to the current new links
          _this.previousPdfLinks = newLinks;
          // Update the component's content property with the latest editor content
          _this.content = contents;
          // Sanitize the content and update safeHtml for safe display
          _this.safeHtml = _this.sanitizer.bypassSecurityTrustHtml(contents);
          // Save the content to localStorage for persistence on page reload
          localStorage.setItem('planDocumentsContent', contents);
          // Manually trigger Angular change detection to update the view
          _this.cdr.detectChanges();
        }
      }
    });

    // Set the editor's initial content to previously saved content
    ($('#summernote-plan') as any).summernote('code', this.content);

    // Add a dark theme CSS class to Summernote editor after short delay (for styling)
    setTimeout(() => {
      $('.note-editor').addClass('dark-theme');
    }, 100);
  }

  // Called when user clicks the Save button
  saveContent() {
    const htmlContent = this.content;  // Get current content from editor
    const benefitsId = 3;              // Hardcoded example benefits ID for saving to backend

    // Save the content also to localStorage (client-side persistence)
    localStorage.setItem('planDocumentsContent', htmlContent);

    // Send POST request to backend to save the content in database
    this.http.post('http://localhost:3000/saveBenefitsData', {
      benefits_id: benefitsId,
      benefits_content: htmlContent
    }).subscribe(
      (data) => {
        // Log success and notify user
        console.log('✅ Content saved to DB:', data);
        alert('✔ Content saved to server!');
      },
      (err) => {
        // Log error and notify user
        console.error('❌ Error saving to DB:', err);
        alert('❌ Failed to save content to server.');
      }
    );
  }

  // Called when user clicks the Clear button
  clearContent() {
    this.content = '';               // Clear the component's content variable
    this.safeHtml = '';              // Clear the sanitized HTML variable
    localStorage.removeItem('planDocumentsContent'); // Remove saved content from localStorage
    ($('#summernote-plan') as any).summernote('reset');  // Reset the Summernote editor content to empty
  }

  // Helper method to extract all PDF links from a given HTML content string
  extractPdfLinks(content: string): string[] {
    // Parse the HTML content into a DOM Document
    const doc = new DOMParser().parseFromString(content, 'text/html');
    // Select all anchor (<a>) tags in the content
    const anchors = doc.querySelectorAll('a');
    // Map all href attributes of anchors and filter only those ending with '.pdf'
    return Array.from(anchors)
      .map(a => a.href)
      .filter(href => href.endsWith('.pdf'));
  }
}




