import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { AnamnesisComponent } from './anamnesis.component';

describe('AnamnesisComponent business rules', () => {
  let anamnesisSubject: BehaviorSubject<any>;
  let anamnesisService: any;
  let childService: any;
  let component: AnamnesisComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    anamnesisSubject = new BehaviorSubject(null);
    anamnesisService = {
      anamnesis$: anamnesisSubject,
      loading$: of(false),
      saving$: of(false),
      error$: of(null),
      clearState: jasmine.createSpy('clearState'),
      loadByChildId: jasmine.createSpy('loadByChildId').and.returnValue(of(null)),
      upsertBirth: jasmine.createSpy('upsertBirth').and.returnValue(of({})),
      deleteBirth: jasmine.createSpy('deleteBirth').and.returnValue(of(void 0)),
      updateGeneralNotes: jasmine.createSpy('updateGeneralNotes').and.returnValue(of({})),
    };
    childService = {
      children$: of([]),
      loading$: of(false),
      error$: of(null),
      selectChild: jasmine.createSpy('selectChild'),
      selectChildById: jasmine.createSpy('selectChildById'),
      loadAccessibleChildren: jasmine.createSpy('loadAccessibleChildren').and.returnValue(of([])),
    };
    const route = { queryParamMap: of({ get: () => null }) };
    const authService = { currentUser$: of({ id: 'user-1', role: 'common' }) };
    component = TestBed.runInInjectionContext(
      () =>
        new AnamnesisComponent(route as any, anamnesisService, childService, authService as any),
    );
  });

  it('clears previous state when the selected child is removed', () => {
    component.selectedChildId = 'child-1';
    component.activeSection = 'health';
    component.onChildSelected('  ');

    expect(component.selectedChildId).toBeNull();
    expect(component.activeSection).toBeNull();
    expect(childService.selectChild).toHaveBeenCalledWith(null);
    expect(anamnesisService.clearState).toHaveBeenCalled();
    expect(anamnesisService.loadByChildId).not.toHaveBeenCalled();
  });

  it('selects a child, clears stale data and loads that child anamnesis', () => {
    component.onChildSelected(' child-1 ');
    expect(component.selectedChildId).toBe('child-1');
    expect(childService.selectChildById).toHaveBeenCalledWith('child-1');
    expect(anamnesisService.clearState).toHaveBeenCalled();
    expect(anamnesisService.loadByChildId).toHaveBeenCalledWith('child-1');
  });

  it('does not save without a child and uses create/update semantics from the snapshot', () => {
    const payload = { gestationalWeeks: 39 } as any;
    component.onSaveBirth(payload);
    expect(anamnesisService.upsertBirth).not.toHaveBeenCalled();

    component.selectedChildId = 'child-1';
    (component as any).anamnesisSnapshot = { birth: { id: 'birth-1' } };
    component.onSaveBirth(payload);
    expect(anamnesisService.upsertBirth).toHaveBeenCalledWith('child-1', payload, true);
    expect(component.sectionWasSaved).toBeTrue();
  });

  it('requires confirmation before deleting a section', () => {
    component.selectedChildId = 'child-1';
    const confirmSpy = spyOn(window, 'confirm').and.returnValues(false, true);

    component.onDeleteBirth();
    expect(anamnesisService.deleteBirth).not.toHaveBeenCalled();
    component.onDeleteBirth();
    expect(confirmSpy).toHaveBeenCalledTimes(2);
    expect(anamnesisService.deleteBirth).toHaveBeenCalledWith('child-1');
  });
});
