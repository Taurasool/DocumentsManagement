

// // Import Angular's HTTP client to enable communication with the backend server
// import { HttpClient } from '@angular/common/http';

// //import { MatProgressBarModule } from '@angular/material/progress-bar'; // NEW

// // Import core Angular features like Component, lifecycle hook AfterViewInit,
// // ViewEncapsulation to control CSS scope, and ChangeDetectorRef for manual change detection
// import {
//   Component,
//   AfterViewInit,
//   ViewEncapsulation,
//   ChangeDetectorRef
// } from '@angular/core';
// // Import CommonModule and FormsModule for basic Angular directives and form handling
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// // Import Angular's DomSanitizer to safely render HTML content and prevent security issues
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// // Declare jQuery globally to use Summernote editor via jQuery syntax
// declare var $: any;
// @Component({
//   selector: 'app-root',                   // This component will be used as <app-root> in HTML
//   standalone: true,                       // This is a standalone component, no Angular module wrapping needed
//   imports: [CommonModule, FormsModule,],  // Import necessary Angular modules here
//   templateUrl: './medical-insurance.component.html',  // HTML template file for this component
//   styleUrls: ['./medical-insurance.component.css'],    // CSS styles for this component
//   encapsulation: ViewEncapsulation.None  // Disable style encapsulation so CSS applies globally
// })
// export class MedicalInsuranceComponent implements AfterViewInit {
//   // Variable to store sanitized HTML content safely for rendering in template
//   safeHtml: SafeHtml = '';
//   // Variable to hold the raw HTML content string from the Summernote editor
//   content: string = '';
//   // Array to keep track of previously existing PDF links in the editor content
//   oldPdfLinks: string[] = [];

//   constructor(
//     private sanitizer: DomSanitizer,       // Inject DomSanitizer service to sanitize HTML
//     private cdr: ChangeDetectorRef,        // Inject ChangeDetectorRef for manual change detection
//     private http: HttpClient                // Inject HttpClient to make HTTP requests to backend
//   ) {}

//   // Lifecycle hook runs after the component's view is fully initialized
//   ngAfterViewInit(): void {
//     // Initialize Summernote rich text editor on the element with id 'summernote'
//     $('#summernote').summernote({
//       placeholder: '✍ Start typing here...',   // Placeholder text inside editor
//       tabsize: 2,                              // Tab key spacing set to 2 spaces
//       height: 300,                            // Editor height in pixels
//       fontSizes: ['8', '10', '12', '14', '16', '18', '24', '36'],  // Available font sizes in editor
//       toolbar: [                             // Toolbar button groups and buttons defined here
//         ['style', ['style']],
//         ['font', ['bold', 'italic', 'underline', 'clear', 'fontsize']],
//         ['fontname', ['fontname']],
//         ['color', ['color']],
//         ['para', ['ul', 'ol', 'paragraph']],
//         ['insert', ['table', 'link', 'picture', 'attachPdf']],  // Custom button 'Attach PDF' added
//         ['view', ['fullscreen', 'codeview']],
//         ['misc', ['undo', 'redo']]
//       ],
//       fontNames: ['Arial', 'Roboto', 'Lato', 'Open Sans', 'Serif', 'Monospace'], // Available fonts

//       // Define a custom button 'attachPdf' for attaching PDF files as links
//       buttons: {
//         attachPdf: () => {
//           const ui = $.summernote.ui;
//           return ui.button({
//             contents: '<i class="note-icon-link"></i> Attach PDF', // Button content: icon + text
//             tooltip: 'Attach PDF to selected text',                // Tooltip on hover
//             click: () => {
//               // Get the currently selected text in the Summernote editor
//               const selectedText = $('#summernote').summernote('getSelectedText');
//               if (!selectedText) {
//                 alert('First, select the text that you want to turn into a PDF link.');
//                 return; // If no text selected, show alert and exit
//               }

//               // Create an invisible file input element to let user pick a PDF file
//               const input = document.createElement('input');
//               input.type = 'file';
//               input.accept = '.pdf';  // Only allow PDF files to be selected

//               // When user selects a file, handle the upload process
//               input.onchange = (e: any) => {
//                 const file = e.target.files[0];
//                 if (!file) return; // If no file selected, do nothing

//                 // Create FormData and append the selected PDF file for upload
//                 const formData = new FormData();
//                 formData.append('pdf', file);

//                 // Make HTTP POST request to backend server to upload the PDF
//                 this.http.post('http://localhost:3000/upload', formData).subscribe(
//                   (data: any) => {
//                     // On successful upload, get the file URL from response
//                     const fileUrl = 'http://localhost:3000' + data.filePath;
//                     // Create an anchor tag wrapping selected text with href as PDF link
//                     const anchorTag = `<a href="${fileUrl}" target="_blank">${selectedText}</a>`;
//                     // Insert the anchor tag HTML into Summernote editor at current cursor
//                     $('#summernote').summernote('pasteHTML', anchorTag);
//                   },
//                   (err) => {
//                     console.error('❌ Upload error:', err);
//                     alert('❌ PDF upload failed.');
//                   }
//                 );
//               };

//               // Programmatically click the input to open the file dialog for user
//               input.click();
//             }
//           }).render();
//         }
//       }
//     });

//     // If saved content is found in browser's localStorage, load it into editor
//     const saved = localStorage.getItem('summernoteContent');
//     if (saved) {
//       $('#summernote').summernote('code', saved);         // Set the saved HTML content in Summernote
//       this.content = saved;                               // Store content in component variable
//       this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(saved); // Sanitize content safely
//       this.oldPdfLinks = this.extractPdfLinks(saved);    // Extract existing PDF links from content
//       console.log('📥 Content loaded from localStorage');
//       this.cdr.detectChanges();                           // Trigger Angular change detection manually
//     }
//   }

//   // Function to handle saving content when user clicks 'Save' button
//   saveContent() {
//     const htmlContent = $('#summernote').summernote('code'); // Get current editor HTML content
//     const title = 'Medical Insurance';                       // Title for database entry

//     // Store content both in component variables and browser's localStorage
//     this.content = htmlContent;
//     this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
//     localStorage.setItem('summernoteContent', htmlContent);

//     // Extract all PDF links currently present in the editor content
//     const newPdfLinks = this.extractPdfLinks(htmlContent);
//     // Find which old PDF links were deleted by comparing with new links
//     const deletedLinks = this.oldPdfLinks.filter(oldLink => !newPdfLinks.includes(oldLink));

//     // If any PDF links were deleted, send requests to backend to delete those files
//     if (deletedLinks.length > 0) {
//       deletedLinks.forEach(link => {
//         const fileName = link.split('/').pop(); // Extract file name from the URL
//         this.http.post('http://localhost:3000/delete-pdf', {
//           fileName: fileName
//         }).subscribe(
//           () => console.log('🗑 Deleted PDF sent to backend:', fileName),
//           err => console.error('❌ Error deleting PDF:', err)
//         );
//       });
//     }

//     // Send POST request to backend to save the editor content into database
//     this.http.post('http://localhost:3000/save-editor', {
//        benefits_name: title,              // Title field for database record
//        benefits_content: htmlContent     // HTML content field
//     }).subscribe(
//       (data) => {
//         console.log('✅ Content saved to DB:', data);
//         alert('✔ Content saved to server!');
//         this.oldPdfLinks = newPdfLinks; // Update oldPdfLinks with current links after save
//       },
//       (err) => {
//         console.error('❌ Error saving to DB:', err);
//         alert('❌ Failed to save to server.');
//       }
//     );
//   }

//   // Function to clear/reset the editor content on 'Clear' button click
//   clearContent() {
//     $('#summernote').summernote('reset'); // Reset Summernote editor content
//     this.content = '';                     // Clear component content variable
//     this.safeHtml = '';                    // Clear safeHtml variable
//     localStorage.removeItem('summernoteContent'); // Remove saved content from localStorage
//     this.oldPdfLinks = [];                 // Clear tracked PDF links array
//   }

//   // Helper function to extract all PDF URLs from the given HTML content string
//   private extractPdfLinks(content: string): string[] {
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(content, 'text/html'); // Parse string as HTML document
//     // Select all <a> tags where href attribute ends with '.pdf'
//     const anchors = doc.querySelectorAll('a[href$=".pdf"]');
//     // Convert NodeList to array of href values (PDF URLs), filtering out empty ones
//     return Array.from(anchors).map(a => a.getAttribute('href') || '').filter(link => !!link);
//   }
// }





























import { HttpClient } from '@angular/common/http';
import {
  Component,
  AfterViewInit,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

declare var $: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medical-insurance.component.html',
  styleUrls: ['./medical-insurance.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MedicalInsuranceComponent implements AfterViewInit {

  uploadInProgress: boolean = true;
  uploadProgress: number = 0;
  safeHtml: SafeHtml = '';
  content: string = '';
  oldPdfLinks: string[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngAfterViewInit(): void {
    $('#summernote').summernote({
      placeholder: '✍ Start typing here...',
      tabsize: 2,
      height: 300,
      fontSizes: ['8', '10', '12', '14', '16', '18', '24', '36'],
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'clear', 'fontsize']],
        ['fontname', ['fontname']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['insert', ['table', 'link', 'picture', 'attachPdf']],
        ['view', ['fullscreen', 'codeview']],
        ['misc', ['undo', 'redo']]
      ],
      fontNames: ['Arial', 'Roboto', 'Lato', 'Open Sans', 'Serif', 'Monospace'],
      buttons: {
        attachPdf: () => {
          const ui = $.summernote.ui;
          return ui.button({
            contents: '<i class="note-icon-link"></i> Attach PDF',
            tooltip: 'Attach PDF to selected text',
            click: () => {
              const selectedText = $('#summernote').summernote('getSelectedText');
              if (!selectedText) {
                alert('First, select the text that you want to turn into a PDF link.');
                return;
              }

              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf';

              input.onchange = (e: any) => {
                const file = e.target.files[0];
                if (!file) return;

                const formData = new FormData();
                formData.append('pdf', file);

                this.http.post('http://localhost:3000/upload', formData).subscribe(
                  (data: any) => {
                    const fileUrl = 'http://localhost:3000' + data.filePath;
                    const anchorTag = `<a href="${fileUrl}" target="_blank">${selectedText}</a>`;
                    $('#summernote').summernote('pasteHTML', anchorTag);
                  },
                  (err) => {
                    console.error('❌ Upload error:', err);
                    alert('❌ PDF upload failed.');
                  }
                );
              };

              input.click();
            }
          }).render();
        }
      }
    });

    const saved = localStorage.getItem('summernoteContent');
    if (saved) {
      $('#summernote').summernote('code', saved);
      this.content = saved;
      this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(saved);
      this.oldPdfLinks = this.extractPdfLinks(saved);
      console.log('📥 Content loaded from localStorage');
      this.cdr.detectChanges();
    }
  }
  saveContent() {
    const htmlContent = $('#summernote').summernote('code');
    const title = 'Medical Insurance';
    this.content = htmlContent;
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
    localStorage.setItem('summernoteContent', htmlContent);

    const newPdfLinks = this.extractPdfLinks(htmlContent);
    const deletedLinks = this.oldPdfLinks.filter(oldLink => !newPdfLinks.includes(oldLink));

    if (deletedLinks.length > 0) {
      deletedLinks.forEach(link => {
        const fileName = link.split('/').pop();
        this.http.post('http://localhost:3000/delete-pdf', {
          fileName: fileName
        }).subscribe(
          () => console.log('🗑 Deleted PDF sent to backend:', fileName),
          err => console.error('❌ Error deleting PDF:', err)
        );
      });
    }

    // First: GET request to check if `benefits_name` exists and get `benefits_id`
    this.http.get<any>(`http://localhost:3000/benefit-id?name=${title}`).subscribe(
      (response) => {
        if (!response || !response.benefits_id) {
          alert('❌ Benefit name not found in table_benefits.');
          return;
        }

        const benefitId = response.benefits_id;

        // Then: POST content to benefits_data
        this.http.post('http://localhost:3000/save-editor', {
          benefits_id: benefitId,
          benefits_content: htmlContent
        }).subscribe(
          (data) => {
            console.log('✅ Content saved to DB:', data);
            alert('✔ Content saved to server!');
            this.oldPdfLinks = newPdfLinks;
          },
          (err) => {
            console.error('❌ Error saving to DB:', err);
            alert('❌ Failed to save to server.');
          }
        );
      },
      (err) => {
        console.error('❌ Error fetching benefit ID:', err);
        alert('❌ Error fetching benefit ID.');
      }
    );
  }

  clearContent() {
    $('#summernote').summernote('reset');
    this.content = '';
    this.safeHtml = '';
    localStorage.removeItem('summernoteContent');
    this.oldPdfLinks = [];
  }

  private extractPdfLinks(content: string): string[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const anchors = doc.querySelectorAll('a[href$=".pdf"]');
    return Array.from(anchors).map(a => a.getAttribute('href') || '').filter(link => !!link);
  }
}










































// import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
// import {
//   Component,
//   AfterViewInit,
//   ViewEncapsulation,
//   ChangeDetectorRef
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// declare var $: any;

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './medical-insurance.component.html',
//   styleUrls: ['./medical-insurance.component.css'],
//   encapsulation: ViewEncapsulation.None
// })
// export class MedicalInsuranceComponent implements AfterViewInit {

//   uploadInProgress: boolean = false;
//   uploadProgress: number = 0;

//   safeHtml: SafeHtml = '';
//   content: string = '';
//   oldPdfLinks: string[] = [];

//   constructor(
//     private sanitizer: DomSanitizer,
//     private cdr: ChangeDetectorRef,
//     private http: HttpClient
//   ) {}

//   ngAfterViewInit(): void {
//     $('#summernote').summernote({
//       placeholder: '✍ Start typing here...',
//       tabsize: 2,
//       height: 300,
//       fontSizes: ['8', '10', '12', '14', '16', '18', '24', '36'],
//       toolbar: [
//         ['style', ['style']],
//         ['font', ['bold', 'italic', 'underline', 'clear', 'fontsize']],
//         ['fontname', ['fontname']],
//         ['color', ['color']],
//         ['para', ['ul', 'ol', 'paragraph']],
//         ['insert', ['table', 'link', 'picture', 'attachPdf']],
//         ['view', ['fullscreen', 'codeview']],
//         ['misc', ['undo', 'redo']]
//       ],
//       fontNames: ['Arial', 'Roboto', 'Lato', 'Open Sans', 'Serif', 'Monospace'],
//       buttons: {
//         attachPdf: () => {
//           const ui = $.summernote.ui;
//           return ui.button({
//             contents: '<i class="note-icon-link"></i> Attach PDF',
//             tooltip: 'Attach PDF to selected text',
//             click: () => {
//               const selectedText = $('#summernote').summernote('getSelectedText');
//               if (!selectedText) {
//                 alert('First, select the text that you want to turn into a PDF link.');
//                 return;
//               }

//               const input = document.createElement('input');
//               input.type = 'file';
//               input.accept = '.pdf';

//               input.onchange = (e: any) => {
//                 const file = e.target.files[0];
//                 if (!file) return;

//                 const formData = new FormData();
//                 formData.append('pdf', file);

//                 this.uploadInProgress = true;
//                 this.uploadProgress = 0;

//                 this.http.post('http://localhost:3000/upload', formData, {
//                   reportProgress: true,
//                   observe: 'events'
//                 }).subscribe(
//                   (event: HttpEvent<any>) => {
//                     if (event.type === HttpEventType.UploadProgress && event.total) {
//                       this.uploadProgress = Math.round((event.loaded / event.total) * 100);
//                     } else if (event.type === HttpEventType.Response) {
//                       const data = event.body;
//                       const fileUrl = 'http://localhost:3000' + data.filePath;
//                       const anchorTag = `<a href="${fileUrl}" target="_blank">${selectedText}</a>`;
//                       $('#summernote').summernote('pasteHTML', anchorTag);

//                       this.uploadInProgress = false;
//                       this.uploadProgress = 0;
//                     }
//                   },
//                   (err) => {
//                     console.error('❌ Upload error:', err);
//                     alert('❌ PDF upload failed.');
//                     this.uploadInProgress = false;
//                   }
//                 );
//               };

//               input.click();
//             }
//           }).render();
//         }
//       }
//     });

//     const saved = localStorage.getItem('summernoteContent');
//     if (saved) {
//       $('#summernote').summernote('code', saved);
//       this.content = saved;
//       this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(saved);
//       this.oldPdfLinks = this.extractPdfLinks(saved);
//       console.log('📥 Content loaded from localStorage');
//       this.cdr.detectChanges();
//     }
//   }

//   saveContent() {
//     const htmlContent = $('#summernote').summernote('code');
//     const title = 'Medical Insurance';

//     this.content = htmlContent;
//     this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
//     localStorage.setItem('summernoteContent', htmlContent);

//     const newPdfLinks = this.extractPdfLinks(htmlContent);
//     const deletedLinks = this.oldPdfLinks.filter(oldLink => !newPdfLinks.includes(oldLink));

//     if (deletedLinks.length > 0) {
//       deletedLinks.forEach(link => {
//         const fileName = link.split('/').pop();
//         this.http.post('http://localhost:3000/delete-pdf', {
//           fileName: fileName
//         }).subscribe(
//           () => console.log('🗑 Deleted PDF sent to backend:', fileName),
//           err => console.error('❌ Error deleting PDF:', err)
//         );
//       });
//     }

//     this.http.get<any>(`http://localhost:3000/benefit-id?name=${title}`).subscribe(
//       (response) => {
//         if (!response || !response.benefits_id) {
//           alert('❌ Benefit name not found in table_benefits.');
//           return;
//         }

//         const benefitId = response.benefits_id;

//         this.http.post('http://localhost:3000/save-editor', {
//           benefits_id: benefitId,
//           benefits_content: htmlContent
//         }).subscribe(
//           (data) => {
//             console.log('✅ Content saved to DB:', data);
//             alert('✔ Content saved to server!');
//             this.oldPdfLinks = newPdfLinks;
//           },
//           (err) => {
//             console.error('❌ Error saving to DB:', err);
//             alert('❌ Failed to save to server.');
//           }
//         );
//       },
//       (err) => {
//         console.error('❌ Error fetching benefit ID:', err);
//         alert('❌ Error fetching benefit ID.');
//       }
//     );
//   }

//   clearContent() {
//     $('#summernote').summernote('reset');
//     this.content = '';
//     this.safeHtml = '';
//     localStorage.removeItem('summernoteContent');
//     this.oldPdfLinks = [];
//   }

//   private extractPdfLinks(content: string): string[] {
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(content, 'text/html');
//     const anchors = doc.querySelectorAll('a[href$=".pdf"]');
//     return Array.from(anchors).map(a => a.getAttribute('href') || '').filter(link => !!link);
//   }
// }
