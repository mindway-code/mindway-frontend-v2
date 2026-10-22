import { Component, OnInit } from "@angular/core";
import { ChildRecord } from "../../api/interfaces/child.interface";
import { ChildService } from "../../services/child.service";

@Component({
  selector: "app-access-history",
  standalone: false,
  templateUrl: "./access-history.component.html",
  styleUrls: ["./access-history.component.scss"],
})
export class AccessHistoryComponent implements OnInit {
  children: ChildRecord[] = [];
  selectedChildId = "";
  searchTerm = "";
  userFilter = "all";
  institutionFilter = "all";
  periodFilter = "";
  loading = true;
  errorMessage = "";

  constructor(private readonly childService: ChildService) {}

  ngOnInit(): void {
    this.childService.loadAccessibleChildren({ page: 1, pageSize: 50 }).subscribe({
      next: (children) => {
        this.children = children;
        this.selectedChildId = children[0]?.id ?? "";
        this.loading = false;
      },
      error: () => {
        this.errorMessage = "Não foi possível carregar as crianças agora.";
        this.loading = false;
      },
    });
  }

  get selectedChild(): ChildRecord | null {
    return this.children.find((child) => child.id === this.selectedChildId) ?? null;
  }

  getChildInitial(child: ChildRecord): string {
    return child.name?.trim().charAt(0).toUpperCase() || "C";
  }

  getChildPhoto(child: ChildRecord): string | null {
    if (typeof localStorage === "undefined") return null;
    try {
      const saved = localStorage.getItem(`mindway-child-profile-${child.id}`);
      const profile = saved ? JSON.parse(saved) : null;
      return typeof profile?.photo === "string" ? profile.photo : null;
    } catch {
      return null;
    }
  }

  formatBirthDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Nascimento não informado" : new Intl.DateTimeFormat("pt-BR").format(date);
  }

  clearFilters(): void {
    this.searchTerm = "";
    this.userFilter = "all";
    this.institutionFilter = "all";
    this.periodFilter = "";
  }
}
