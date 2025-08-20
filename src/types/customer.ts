export interface Customer {
  id: number;
  title: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  affiliation: string | null;
  position: string | null;
  type: number | null;
  paper_number: string | null;
  have_visa: number | null;
  dietary_requirements: string | null;
  intent_id: string | null;
  status: number | null;
  invoice_no: number | null;
  create_date: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  other_explain: string | null;
  attendee_name: string | null;
}

export interface CustomerResponse {
  data: Customer[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
