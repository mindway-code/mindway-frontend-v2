import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import type { ChildRecord, CreateChildDTO } from '../../../../api/interfaces/child.interface';

@Component({
  selector: 'app-child-profile-form-modal',
  standalone: false,
  templateUrl: './child-profile-form-modal.component.html',
  styleUrl: './child-profile-form-modal.component.scss',
})
export class ChildProfileFormModalComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('dialog') dialog?: ElementRef<HTMLElement>;
  @ViewChild('nameInput') nameInput?: ElementRef<HTMLInputElement>;

  @Input() child: ChildRecord | null = null;
  @Input() saving = false;
  @Input() error: string | null = null;

  @Output() save = new EventEmitter<CreateChildDTO>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    birthDate: ['', Validators.required],
    observation: [''],
  });
  readonly maxBirthDate = this.toDateInputValue(new Date());
  age: number | null = null;
  attemptedSave = false;

  private readonly birthDateSubscription: Subscription;
  private previousBodyOverflow = '';
  private readonly previousFocus =
    typeof document === 'undefined' ? null : (document.activeElement as HTMLElement | null);

  constructor(private readonly fb: FormBuilder) {
    this.birthDateSubscription = this.form.controls.birthDate.valueChanges.subscribe((value) => {
      this.age = this.calculateAge(value);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['child']) return;
    this.attemptedSave = false;
    const birthDate = this.child?.birthDate?.slice(0, 10) ?? '';
    this.form.reset({
      name: this.child?.name ?? '',
      birthDate,
      observation: this.child?.observation ?? '',
    });
    this.age = this.calculateAge(birthDate);
  }

  ngAfterViewInit(): void {
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.nameInput?.nativeElement.focus());
  }

  ngOnDestroy(): void {
    this.birthDateSubscription.unsubscribe();
    document.body.style.overflow = this.previousBodyOverflow;
    queueMicrotask(() => {
      if (this.previousFocus?.isConnected) this.previousFocus.focus();
    });
  }

  close(): void {
    if (!this.saving) this.cancel.emit();
  }

  submit(): void {
    if (this.saving) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const age = this.calculateAge(raw.birthDate);
    if (age === null) {
      this.form.controls.birthDate.setErrors({ invalidDate: true });
      return;
    }

    this.attemptedSave = true;
    this.save.emit({
      name: raw.name?.trim() ?? '',
      age,
      birthDate: raw.birthDate ?? '',
      observation: raw.observation?.trim() || null,
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = this.dialog?.nativeElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private calculateAge(birthDate: string | null | undefined): number | null {
    if (!birthDate) return null;
    const birth = new Date(`${birthDate}T00:00:00`);
    if (Number.isNaN(birth.getTime()) || this.toDateInputValue(birth) !== birthDate) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
    return age >= 0 ? age : null;
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
