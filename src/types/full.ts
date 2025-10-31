export enum UserCompany {
    INCAUCA_SAS = "incauca_sas",
    INCAUCA_COSECHA = "incauca_cosecha",
    PROVIDENCIA_SAS = "providencia_sas",
    PROVIDENCIA_COSECHA = "providencia_cosecha",
    CONALTA = "conalta",
    PICHICHI_SAS = "pichichi_sas",
    PICHICHI_COORTE = "pichichi_corte",
    VALOR_AGREGADO = "valor_agregado",
    NO = 'no',
}

export enum DocumentType {
    CITIZENSHIP_CARD = "CC",
    FOREIGNER_ID = "CE",
    PASSPORT = "PASAPORTE"
}

export enum LoanStatus {
    PENDING = "Pendiente",
    APPROVED = "Aprobado",
    POSTPONED = "Aplazado",
    DRAFT = "Borrador",
    ARCHIVED = "Archivado"
}

export enum IntranetRole {
    ADMIN = "admin",
    EMPLOYEE = "employee"
}

export enum IssueStatus {
    ACTIVE = "activo",
    PENDING = "pendiente",
    FIXED = "corregido"
}

export enum IssuePriority {
    LOW = "Baja",
    MEDIUM = "Media",
    HIGH = "Alta",
    CRITICAL = "Critica"
}

export enum ApplicationType {
    INTRANET = "intranet",
    CLIENTS = "clients"
}

export enum SessionStatus {
    ACTIVE = "activo",
    REVOKED = "revocado"
}

// Types
export type User = {
    id: string;
    password: string;
    email: string;
    names: string;
    firstLastName: string;
    secondLastName: string;
    currentCompanie: UserCompany;
    avatar: string;
    phone: string
    residence_phone_number: string;
    phone_whatsapp: string;
    birth_day?: Date;
    place_of_birth?: string;
    genre: string;
    residence_address: string;
    city: string;
    isBanned?: boolean;
    createdAt: Date;
    updatedAt: Date;

    // Relations
    Document: Document[];
    LoanApplication: ILoanApplication[];
}

export type Document = {
    id: string;
    userId: string;
    documentSides: string;
    upId: string;
    imageWithCC: string;
    typeDocument: DocumentType;
    number: string;
    createdAt: Date;
    updatedAt: Date;

    // Relations
    user: User;
}

export type IntranetUser = {
    id: string;
    name: string;
    lastNames: string;
    email: string;
    password: string;
    phone: string;
    role: string;
    isActive: boolean;
    avatar: string;
    updatedAt: Date;
    createdAt: Date;
}

export type ILoanApplication = {
    id: string;
    userId: string;
    employeeId?: string;
    phone: string
    cantity: string;
    fisrt_flyer?: string;
    upid_first_flyer?: string;
    second_flyer?: string;
    upid_second_flyer?: string;
    third_flyer?: string;
    upid_third_flyer?: string;
    reasonChangeCantity?: string;
    amountChangeReason?: string;
    requestedAmount: string;
    reasonReject?: string;
    newCantity?: string;
    newCantityOpt?: boolean;
    hasBankSavingsAccount: boolean;
    bankNumberAccount: string;
    entity: string;
    labor_card?: string;
    city: string;
    residence_address: string;
    upid_labor_card?: string;
    terms_and_conditions: boolean;
    signature: string;
    upSignatureId: string;
    isDisbursed: string
    cycode: string;
    extract: string;
    status: LoanStatus;
    created_at: Date;
    updated_at: Date;

    // Relations
    user: User;
    GeneratedDocuments: GeneratedDocument[];
    EventLoanApplication: eventLoanApplication[]
}

export type eventLoanApplication = {
    id: string
    loanId: string
    LoanApplication?: ILoanApplication
    type: TypeEventLoan
    isAnswered: boolean
    created_at: Date
}

export type GeneratedDocument = {
    id: string;
    loanId: string;
    uploadId: string;
    publicUrl?: string;
    fileType: string;
    documentTypes: string[];
    downloadCount: number;
    createdAt: Date;
    updatedAt: Date;

    // Relations
    loanApplication: ILoanApplication;
}

export type WhatsappSession = {
    id: string;
    sessionId: string;
    status: SessionStatus;
    createdAt: Date;
    updatedAt: Date;
}

export type IssueReport = {
    id: string;
    description: string;
    images: string[];
    application: ApplicationType;
    status: IssueStatus;
    priority?: IssuePriority;
    supportResponse?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Interface for relationships
export interface DatabaseSchema {
    users: User[];
    documents: Document[];
    intranetUsers: IntranetUser[];
    loanApplications: ILoanApplication[];
    generatedDocuments: GeneratedDocument[];
    whatsappSessions: WhatsappSession[];
    issueReports: IssueReport[];
}

type TypeEventLoan = "CHANGE_CANTITY" | "DOCS_REJECT"