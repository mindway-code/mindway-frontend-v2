import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Subject, of } from "rxjs";
import { catchError, filter, switchMap, take, takeUntil } from "rxjs/operators";
import type { MessageRecord } from "../../api/interfaces/message.interface";
import type { UserRecord } from "../../api/interfaces/user.interface";
import { AuthService } from "../../services/auth.service";
import { MessageService } from "../../services/message.service";
import { UserService } from "../../services/user.service";

@Component({
  selector: "app-messages",
  standalone: false,
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.scss"],
})
export class MessagesComponent implements OnInit, OnDestroy {
  readonly messageControl = new FormControl("", {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(2000)],
  });

  contacts: UserRecord[] = [];
  messages: MessageRecord[] = [];
  selectedContact: UserRecord | null = null;
  loadingContacts = false;
  loadingMessages = false;
  sending = false;
  contactsError: string | null = null;
  messagesError: string | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.loadingContacts = true;
    this.contactsError = null;

    this.authService.currentUser$
      .pipe(
        filter((user): user is UserRecord => Boolean(user)),
        take(1),
        switchMap((currentUser) =>
          this.userService.listUsers({ page: 1, pageSize: 100 }).pipe(
            catchError(() => {
              this.contactsError = "Não foi possível carregar os contatos.";
              return of([] as UserRecord[]);
            }),
            switchMap((users) => of(users.filter((user) => user.id !== currentUser.id)))
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((users) => {
        this.contacts = users;
        this.loadingContacts = false;
      });
  }

  selectContact(contact: UserRecord): void {
    this.selectedContact = contact;
    this.messages = [];
    this.messagesError = null;
    this.messageControl.reset();
    this.loadMessages(contact.id);
  }

  loadMessages(contactId: string): void {
    this.loadingMessages = true;
    this.messagesError = null;

    this.messageService
      .listDirectMessages(contactId, { page: 1, pageSize: 100 })
      .pipe(
        catchError(() => {
          this.messagesError = "Não foi possível carregar esta conversa.";
          return of([] as MessageRecord[]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((messages) => {
        this.messages = messages;
        this.loadingMessages = false;
      });
  }

  sendMessage(): void {
    if (!this.selectedContact || this.messageControl.invalid || this.sending) return;

    const content = this.messageControl.value.trim();
    if (!content) return;

    this.sending = true;
    this.messagesError = null;
    this.messageService
      .sendDirectMessage(this.selectedContact.id, { content })
      .pipe(
        catchError(() => {
          this.messagesError = "Não foi possível enviar a mensagem.";
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((message) => {
        this.sending = false;
        if (message) {
          this.messages = [...this.messages, message];
          this.messageControl.reset();
        }
      });
  }

  orderedMessages(): MessageRecord[] {
    return [...this.messages].sort(
      (first, second) => this.toTime(first.createdAt) - this.toTime(second.createdAt)
    );
  }

  messageDate(value: string | Date): string {
    return new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  contactName(contact: UserRecord): string {
    return contact.name?.trim() || contact.email || "Usuário";
  }

  contactInitial(contact: UserRecord): string {
    return this.contactName(contact).charAt(0).toUpperCase();
  }

  isOwnMessage(message: MessageRecord): boolean {
    return message.senderId !== this.selectedContact?.id;
  }

  retryContacts(): void {
    this.loadContacts();
  }

  retryMessages(): void {
    if (this.selectedContact) this.loadMessages(this.selectedContact.id);
  }

  private toTime(value: string | Date): number {
    return new Date(value).getTime();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
