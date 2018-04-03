import {
	Component,
	ViewEncapsulation,
	ViewChild,
	OnInit,
	Sanitizer
} from '@angular/core';
import { FileUploadComponent } from '../../src/components/fileUpload.component';
import { FileUploadService } from '../../src/services/fileupload.service';
import { Subscription } from 'rxjs/Subscription';
import { HttpEventType, HttpParams } from '@angular/common/http';
import { DpbResponse } from '../../src/interfaces/dpbResponse.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
	@ViewChild(FileUploadComponent) private _fileUp: FileUploadComponent;
	private _upProg: Subscription;
	private _hasValidationException: boolean;

	constructor(public filSer: FileUploadService) {
		this._hasValidationException = false;
	}

	ngOnInit() {
		this._fileUp.setOptions({
			classes: {
				buttonAdd: 'ui right labeled green icon tiny button',
				buttonRemoveAll: 'ui button red tiny',
				iconButtonAdd: 'add-test',
				iconButtonRemoveAll: 'remove-test'
			},
			texts: {
				buttonAdd: 'Adicionar <i class="ui icon plus"></i>'
			}
		});

		this.filSer.onValidate$.subscribe(validation => {
			console.log(validation.validation.tags);
			console.log(validation.individualValidation.info);

			const individualIsNotUndefined = validation.individualValidation.info !== undefined;
			const hasIndividualValidation = individualIsNotUndefined && validation.individualValidation.info.length > 0;
			const validationIsNotUndefined = validation.validation.tags !== undefined;
			const hasValidation = validationIsNotUndefined && validation.validation.tags.length > 0;

			if ( hasIndividualValidation || hasValidation ) {
				this._hasValidationException = true;
			}
		});
		this.filSer.setMaxSize(3000027);
		this.filSer.setMaxSizePerFile(3000027);
	}

	public sendFiles() {
		this.filSer.onComplete$.subscribe(e => {
			console.log('COMPLETO!');
		});

		this.filSer.onProgress$.subscribe(e => {
			console.log(e.percent + '%');
		});

		this.filSer.onError$.subscribe(() => {
			console.error('ERROUR!');
		});

		try {
			this.filSer.setFiles(this._fileUp.getFiles());
			if ( this.filSer.isValid() ) {
				this._upProg = this.filSer
					.uploadFile(
						'https://hookb.in/ZB77kXQ2'
					)
					.subscribe((response: DpbResponse) => {
						if (response.type === HttpEventType.UploadProgress) {
						} else if (response.type === HttpEventType.Response) {
							console.log('E acabou!');
						}
					});
			}
		} catch (e) {
			console.error('Não foi possível enviar o arquivo');
			// console.error(e);
		}
	}

	public abort() {
		this._upProg.unsubscribe();
	}

	public hasValidation(): boolean {
		return this._hasValidationException;
	}
}
