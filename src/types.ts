export interface WebshopInfo {
    availability: boolean,
    billPaymentActive: boolean,
    declarationOfConsent: string,
    flexprice: boolean,
    illustrativeExample: string,
    installmentPaymentActive: boolean
    interestRate: number,
    maxBillingValue: number,
    maxFinancingAmount: number,
    maxInstallmentValue: number,
    minBillingValue: number,
    minFinancingAmount: number,
    minInstallmentValue: number,
    privacyApprovalForm: string,
    productDetails: string,
    testMode: boolean
};
export interface InstallmentPlan {
    installment: number,
    lastInstallment: number,
    numberOfInstallments: number,
    totalInterest: number,
    totalValue: number
}
export interface InstallmentError {
    violations: Array<InstallmentErrorViolation>,
    title: string
}
export interface InstallmentErrorViolation {
    message: string
}
export interface InstallmentPlans {
    plans: Array<InstallmentPlan>,
    example: string,
    url: string,
    errors?: InstallmentError
}
export interface InstallmentPlansContainer {
    installmentPlans: Array<InstallmentPlans>,
    maxFinancingAmount: number,
    minFinancingAmount: number
}
export enum METHODS {
    INSTALLMENT = 'INSTALLMENT',
    BILL = 'BILL'
}