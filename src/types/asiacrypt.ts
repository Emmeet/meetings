export interface AsiacryptVisaRequest {
  id: number;
  title: string | null;
  other_title: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  email: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  institute: string | null;
  paper_number: string | null;
  paper_title: string | null;
  academic_profile: string | null;
  conference_interests: string | null;
  has_iacr: number | null;
  iacr_experience: string | null;
  file_name: string | null;
  file_key: string | null;
  type: number | null;
  create_date: string | null;
  send: number | null;
  approve: number | null;
}

export interface AsiacryptVisaRequestResponse {
  data: AsiacryptVisaRequest[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
