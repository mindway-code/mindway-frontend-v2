export interface AnamnesisBirthRecord {
  id: string;
  anamnesisId: string;
  gestationalWeeks?: number | null;
  birthType?: string | null;
  birthWeightGrams?: number | null;
  birthHeightCentimeters?: number | null;
  apgarOneMinute?: number | null;
  apgarFiveMinutes?: number | null;
  birthComplication?: string | null;
  hospitalizationDays?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertAnamnesisBirthDTO {
  gestationalWeeks?: number | null;
  birthType?: string | null;
  birthWeightGrams?: number | null;
  birthHeightCentimeters?: number | null;
  apgarOneMinute?: number | null;
  apgarFiveMinutes?: number | null;
  birthComplication?: string | null;
  hospitalizationDays?: number | null;
}

export interface AnamnesisMotorDevelopmentRecord {
  id: string;
  anamnesisId: string;
  neckControlAgeMonths?: number | null;
  sittingAgeMonths?: number | null;
  crawlingAgeMonths?: number | null;
  firstStepsAgeMonths?: number | null;
  fineCoordination?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertAnamnesisMotorDevelopmentDTO {
  neckControlAgeMonths?: number | null;
  sittingAgeMonths?: number | null;
  crawlingAgeMonths?: number | null;
  firstStepsAgeMonths?: number | null;
  fineCoordination?: string | null;
}

export interface AnamnesisLanguageCommunicationRecord {
  id: string;
  anamnesisId: string;
  firstWordsAgeMonths?: number | null;
  fullSentencesAgeMonths?: number | null;
  comprehension?: string | null;
  currentCommunication?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertAnamnesisLanguageCommunicationDTO {
  firstWordsAgeMonths?: number | null;
  fullSentencesAgeMonths?: number | null;
  comprehension?: string | null;
  currentCommunication?: string | null;
}

export interface AnamnesisHealthRecord {
  id: string;
  anamnesisId: string;
  diagnosis?: string | null;
  medication?: string | null;
  allergies?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertAnamnesisHealthDTO {
  diagnosis?: string | null;
  medication?: string | null;
  allergies?: string | null;
}

export interface AnamnesisBehaviorRecord {
  id: string;
  anamnesisId: string;
  concentrationDifficulty?: string | null;
  interaction?: string | null;
  activityPreference?: string | null;
  anxiety?: string | null;
  hyperactivity?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertAnamnesisBehaviorDTO {
  concentrationDifficulty?: string | null;
  interaction?: string | null;
  activityPreference?: string | null;
  anxiety?: string | null;
  hyperactivity?: string | null;
}

export interface AnamnesisRoutineRecord {
  id: string;
  anamnesisId: string;
  wakesUpAt?: string | null;
  therapies?: string | null;
  schoolPeriod?: string | null;
  extraActivity?: string | null;
  sleepsAt?: string | null;
  routineObservation?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertAnamnesisRoutineDTO {
  wakesUpAt?: string | null;
  therapies?: string | null;
  schoolPeriod?: string | null;
  extraActivity?: string | null;
  sleepsAt?: string | null;
  routineObservation?: string | null;
}

export interface UpdateAnamnesisGeneralNotesDTO {
  generalNotes?: string | null;
}

export interface AnamnesisRecord {
  id: string;
  childId: string;
  generalNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  birth?: AnamnesisBirthRecord | null;
  motorDevelopment?: AnamnesisMotorDevelopmentRecord | null;
  languageCommunication?: AnamnesisLanguageCommunicationRecord | null;
  health?: AnamnesisHealthRecord | null;
  behavior?: AnamnesisBehaviorRecord | null;
  routine?: AnamnesisRoutineRecord | null;
}

