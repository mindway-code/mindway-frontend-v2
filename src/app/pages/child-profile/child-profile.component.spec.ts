import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import type { ChildRecord, CreateChildDTO } from '../../api/interfaces/child.interface';
import { ChildProfileComponent } from './child-profile.component';

function child(id: string, name: string, age: number, diagnosis?: string): ChildRecord {
  return { id, name, age, birthDate: '2018-01-01', diagnosis } as any;
}

describe('ChildProfileComponent business rules', () => {
  let childService: any;
  let associationService: any;
  let router: any;
  let component: ChildProfileComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    const selectedChild = new BehaviorSubject<ChildRecord | null>(null);
    childService = {
      children$: of([]),
      selectedChild$: selectedChild,
      loading$: of(false),
      saving$: of(false),
      error$: of(null),
      selectChild: jasmine.createSpy('selectChild'),
      getSelectedChildSnapshot: jasmine.createSpy('getSelectedChildSnapshot').and.returnValue(null),
      createChild: jasmine.createSpy('createChild').and.returnValue(of(child('new', 'New', 5))),
      updateChild: jasmine.createSpy('updateChild').and.returnValue(of(child('c1', 'Updated', 8))),
      loadAccessibleChildren: jasmine.createSpy('loadAccessibleChildren').and.returnValue(of([])),
    };
    associationService = {
      loading$: of(false),
      error$: of(null),
      associateByAccessCode: jasmine.createSpy('associateByAccessCode'),
    };
    router = jasmine.createSpyObj('Router', ['navigate']);
    const authService = { currentUser$: of({ id: 'user-1', role: 'common' }) };
    const anamnesisService = { loadByChildId: jasmine.createSpy().and.returnValue(of(null)) };
    const route = {
      queryParamMap: of({ get: () => null }),
      snapshot: { queryParamMap: { get: () => null } },
    };
    component = TestBed.runInInjectionContext(
      () =>
        new ChildProfileComponent(
          childService,
          authService as any,
          anamnesisService as any,
          associationService,
          route as any,
          router,
        ),
    );
  });

  it('filters and sorts the child directory using age, diagnosis and normalized text', () => {
    const children = [
      child('c1', 'Joao', 12),
      child('c2', 'Alvaro', 6, 'TEA'),
      child('c3', 'Beatriz', 4, 'TDAH'),
    ];
    component.childAgeFilter = '0-5';
    component.childDiagnosisFilter = 'with';
    component.childSearch = 'beatriz';

    expect(component.filterChildren(children).map((item) => item.id)).toEqual(['c3']);
  });

  it('creates and reloads a child for a responsible user', () => {
    const payload = { name: 'New Child', age: 5 } as CreateChildDTO;
    component.createChild(payload);
    expect(childService.createChild).toHaveBeenCalledWith(payload);
    expect(childService.loadAccessibleChildren).toHaveBeenCalledWith({ page: 1, pageSize: 50 });
    expect(component.directoryMessage).toBe('Perfil criado.');
  });

  it('prevents professional users from creating or editing child identities', () => {
    component.isProfessionalView = true;
    const existing = child('c1', 'Child', 8);
    component.createChild({ name: 'Blocked' } as CreateChildDTO);
    component.onEditChild(existing);
    component.onAssociateByAccessCode({ accessCode: 'ABC123' } as any);

    expect(childService.createChild).not.toHaveBeenCalled();
    expect(component.editingChild).toBeNull();
    expect(associationService.associateByAccessCode).not.toHaveBeenCalled();
  });

  it('updates an existing child instead of creating a duplicate', () => {
    const existing = child('c1', 'Child', 8);
    const payload = { name: 'Updated Child', age: 9 } as CreateChildDTO;
    component.editingChild = existing;
    component.saveChildProfile(payload);

    expect(childService.updateChild).toHaveBeenCalledWith('c1', payload);
    expect(childService.createChild).not.toHaveBeenCalled();
    expect(component.editingChild).toBeNull();
    expect(component.directoryMessage).toBe('Perfil atualizado.');
  });
});
