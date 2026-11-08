import type { ChildRecord } from '../../api/interfaces/child.interface';

type FlexibleChildRecord = ChildRecord & Record<string, unknown>;

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getFlexibleChild(child: ChildRecord): FlexibleChildRecord {
  return child as FlexibleChildRecord;
}

export function getChildName(child: ChildRecord): string {
  const data = getFlexibleChild(child);
  return asString(data.name) || asString(data['fullName']) || asString(data['nome']) || 'Criança';
}

export function getChildInitial(child: ChildRecord): string {
  return getChildName(child).charAt(0).toUpperCase() || 'C';
}

export function getChildPhoto(child: ChildRecord): string | null {
  const data = getFlexibleChild(child);
  const photo =
    asString(data['photoUrl']) ||
    asString(data['avatarUrl']) ||
    asString(data['imageUrl']) ||
    asString(data['photo']);

  if (photo) return photo;
  if (typeof localStorage === 'undefined') return null;

  try {
    const saved = localStorage.getItem(`mindway-child-profile-${child.id}`);
    const profile = saved ? (JSON.parse(saved) as Record<string, unknown>) : null;
    return asString(profile?.['photo']) || asString(profile?.['photoUrl']) || null;
  } catch {
    return null;
  }
}

export function getChildAge(child: ChildRecord): string {
  const data = getFlexibleChild(child);
  const age: unknown = (data as Record<string, unknown>)['age'];
  if (typeof age === 'number' || (typeof age === 'string' && age.trim())) return `${age} anos`;

  const birthDate =
    asString(data.birthDate) ||
    asString(data['dateOfBirth']) ||
    asString(data['birth_date']) ||
    asString(data['dataNascimento']);
  if (!birthDate) return 'Idade não informada';

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return 'Idade não informada';

  const today = new Date();
  let calculatedAge = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) {
    calculatedAge--;
  }

  return `${calculatedAge} anos`;
}

export function getChildDiagnosisList(child: ChildRecord): string[] {
  const data = getFlexibleChild(child);
  const diagnoses = data['diagnoses'] ?? data['diagnosis'] ?? data['diagnosticos'];

  if (Array.isArray(diagnoses)) {
    return diagnoses
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (!item || typeof item !== 'object') return '';
        const diagnosis = item as Record<string, unknown>;
        return asString(diagnosis['name']) || asString(diagnosis['title']);
      })
      .filter(Boolean);
  }

  return typeof diagnoses === 'string'
    ? diagnoses
        .split(/[,;|]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

export function getChildDiagnoses(child: ChildRecord): string {
  return getChildDiagnosisList(child).join(' • ');
}

export function getChildGender(child: ChildRecord): string {
  const data = getFlexibleChild(child);
  return asString(data['gender']) || asString(data['sex']) || asString(data['genero']);
}
