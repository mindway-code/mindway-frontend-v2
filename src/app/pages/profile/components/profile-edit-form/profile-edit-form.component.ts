import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import type { UpdateUserDTO, UserRecord } from '../../../../api/interfaces/user.interface';

@Component({
  selector: 'app-profile-edit-form',
  standalone: false,
  templateUrl: './profile-edit-form.component.html',
  styleUrl: './profile-edit-form.component.css',
})
export class ProfileEditFormComponent implements OnChanges {
  @Input() user: UserRecord | null = null;
  @Input() saving = false;
  @Input() error: string | null = null;

  @Output() save = new EventEmitter<UpdateUserDTO>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
  });

  profilePhoto: string | null = null;
  photoError: string | null = null;
  photoMessage: string | null = null;

  constructor(private readonly fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']) {
      const name = this.user?.name ?? '';
      const email = this.user?.email ?? '';
      this.form.reset({ name, email }, { emitEvent: false });
      this.loadProfilePhoto();
    }
  }

  onProfilePhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.photoError = null;
    this.photoMessage = null;

    if (!file.type.startsWith('image/')) {
      this.photoError = 'Selecione um arquivo de imagem.';
      return;
    }
    if (file.size > 2_000_000) {
      this.photoError = 'A imagem deve ter no máximo 2 MB.';
      return;
    }

    const storageKey = this.profilePhotoStorageKey;
    if (!storageKey) {
      this.photoError = 'Não foi possível identificar sua conta.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const photo = typeof reader.result === 'string' ? reader.result : null;
      if (!photo) {
        this.photoError = 'Não foi possível ler a imagem selecionada.';
        return;
      }

      try {
        localStorage.setItem(storageKey, photo);
        this.profilePhoto = photo;
        this.photoMessage = 'Foto atualizada neste dispositivo.';
      } catch {
        this.photoError = 'Não foi possível salvar a foto neste dispositivo.';
      }
    };
    reader.onerror = () => {
      this.photoError = 'Não foi possível ler a imagem selecionada.';
    };
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email } = this.form.getRawValue();
    this.save.emit({ name: name?.trim() || undefined, email: email?.trim() || undefined });
  }

  private get profilePhotoStorageKey(): string | null {
    return this.user?.id ? `mindway-account-photo-${this.user.id}` : null;
  }

  private loadProfilePhoto(): void {
    const storageKey = this.profilePhotoStorageKey;
    this.photoError = null;
    this.photoMessage = null;

    if (!storageKey || typeof localStorage === 'undefined') {
      this.profilePhoto = null;
      return;
    }

    try {
      this.profilePhoto = localStorage.getItem(storageKey);
    } catch {
      this.profilePhoto = null;
    }
  }
}
