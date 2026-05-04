# 🦴 Skeleton Index: CapyInn

| Meta | Value |
|------|-------|
| Framework | Tauri 2 (Rust + React) |

## Code Skeleton
### `mhm/src/__mocks__/`
**tauri-core.ts**
```typescript
9:type MockHandler = (args?: Record<string, unknown>) => unknown;
11:const globalState = globalThis as typeof globalThis & {
15:const mockResponses =
19:export function setMockResponse(command: string, handler: MockHandler) {
24:export function setMockResponses(responses: Record<string, MockHandler>) {
29:export function clearMockResponses() {
34:export const invoke = vi.fn(async (command: string, args?: Record<string, unknown>) => {
```

### `mhm/src/__mocks__/`
**tauri-event.ts**
```typescript
6:type EventCallback<T = unknown> = (event: { payload: T }) => void | Promise<void>;
8:const globalState = globalThis as typeof globalThis & {
12:const listeners =
15:export const listen = vi.fn(async (eventName: string, callback: EventCallback) => {
32:export const emit = vi.fn(async (eventName: string, payload?: unknown) => {
36:export const once = vi.fn(async (eventName: string, callback: EventCallback) => {
52:export function resetEventMocks() {
```

### `mhm/src/__mocks__/`
**tauri-process.ts**
```typescript
3:export const relaunch = vi.fn(async () => undefined);
```

### `mhm/src/__mocks__/`
**tauri-updater.ts**
```typescript
3:type MockUpdateConfig = {
12:type MockUpdate = {
23:function sleep(ms: number) {
27:export function setMockAvailableUpdate(config: MockUpdateConfig) {
32:export function setMockCheckError(error: Error) {
36:export function clearMockUpdate() {
41:export const check = vi.fn(async () => {
```

### `mhm/src/`
**App.backupStatus.test.tsx**
```typescript
```

### `mhm/src/`
**App.crashReporting.test.tsx**
```typescript
```

### `mhm/src/`
**App.tsx**
```typescript
40:const NAV_MAIN = [
48:const NAV_MANAGEMENT = [
54:const NAV_SYSTEM = [
58:const PAGE_TITLES: Record<string, string> = {
70:type BackupUiState = {
77:const INITIAL_BACKUP_UI: BackupUiState = {
```

### `mhm/src/`
**App.updateFlow.test.tsx**
```typescript
12:type MockUpdateControllerConfig = {
24:function resetMockUpdateController(
148:function setUserAgent(value: string) {
```

### `mhm/src/components/`
**ActivityDetailDrawer.tsx**
```typescript
9:interface ActivityDetailDrawerProps {
16:const KIND_LABELS: Record<NonNullable<ActivityItem["kind"]>, string> = {
22:function getKindLabel(kind?: ActivityItem["kind"]) {
26:function formatOccurredAt(value?: string) {
```

### `mhm/src/components/`
**AppLogo.tsx**
```typescript
3:type AppLogoProps = {
```

### `mhm/src/components/`
**AppUpdateBadge.test.tsx**
```typescript
```

### `mhm/src/components/`
**AppUpdateBadge.tsx**
```typescript
4:interface AppUpdateBadgeProps {
```

### `mhm/src/components/`
**AppUpdateRestartModal.test.tsx**
```typescript
```

### `mhm/src/components/`
**AppUpdateRestartModal.tsx**
```typescript
4:interface AppUpdateRestartModalProps {
```

### `mhm/src/components/`
**BackupFailureAlert.test.tsx**
```typescript
```

### `mhm/src/components/`
**BackupFailureAlert.tsx**
```typescript
6:export const BACKUP_FAILURE_FALLBACK_MESSAGE =
9:const BACKUP_REASON_LABELS: Record<BackupReason, string> = {
19:export type BackupFailureAlertState = {
25:type BackupFailureAlertProps = {
31:function backupFailureMessage(message: string | null | undefined) {
36:export function BackupFailureAlert({ failure, onDismiss, className }: BackupFailureAlertProps) {
```

### `mhm/src/components/`
**BackupStatusIndicator.test.tsx**
```typescript
```

### `mhm/src/components/`
**BackupStatusIndicator.tsx**
```typescript
6:type BackupStatusIndicatorProps = {
12:const PHASE_CONFIG: Record<
41:export function BackupStatusIndicator({ visible, phase, message }: BackupStatusIndicatorProps) {
```

### `mhm/src/components/`
**CheckinSheet.tsx**
```typescript
17:const emptyGuest = (): GuestInput => ({
```

### `mhm/src/components/`
**CheckoutSettlementModal.test.tsx**
```typescript
10:const booking = {
```

### `mhm/src/components/`
**CheckoutSettlementModal.tsx**
```typescript
14:interface CheckoutSettlementModalProps {
22:const MODE_OPTIONS: Array<{ value: CheckoutSettlementMode; label: string }> = [
```

### `mhm/src/components/`
**CrashReportPrompt.tsx**
```typescript
5:interface CrashReportPromptProps {
```

### `mhm/src/components/`
**GroupCheckinSheet.test.tsx**
```typescript
17:const autoAssignRooms = vi.hoisted(() => vi.fn());
18:const groupCheckIn = vi.hoisted(() => vi.fn());
19:const setGroupCheckinOpen = vi.hoisted(() => vi.fn());
20:const toastError = vi.hoisted(() => vi.fn());
21:const toastSuccess = vi.hoisted(() => vi.fn());
80:const autoAssignUserError: AppError = {
87:const groupCheckInUserError: AppError = {
```

### `mhm/src/components/`
**GroupCheckinSheet.tsx**
```typescript
19:const STEPS = ["Thông tin đoàn", "Chọn phòng", "Thông tin khách", "Xác nhận"];
```

### `mhm/src/components/`
**GroupInvoice.tsx**
```typescript
4:interface Props {
```

### `mhm/src/components/`
**GuestProfileSheet.tsx**
```typescript
10:interface BookingWithRoom {
19:interface GuestHistoryResponse {
```

### `mhm/src/components/`
**InvoiceDialog.tsx**
```typescript
11:interface Props {
```

### `mhm/src/components/`
**InvoicePDF.tsx**
```typescript
23:export interface PricingLine {
28:export interface InvoiceData {
53:export type { GroupInvoiceData };
55:const navy = "#1B2A4A";
56:const navyLight = "#2D4373";
57:const gold = "#C5A55A";
58:const gray100 = "#F8F9FA";
59:const gray300 = "#DEE2E6";
60:const gray600 = "#6C757D";
61:const gray800 = "#343A40";
63:const s = StyleSheet.create({
326:interface InvoicePDFProps {
```

### `mhm/src/components/layout/`
**AppLayout.tsx**
```typescript
```

### `mhm/src/components/`
**ReservationSheet.test.tsx**
```typescript
12:const invoke = vi.hoisted(() => vi.fn());
13:const invokeWriteCommand = vi.hoisted(() => vi.fn());
14:const createCorrelationId = vi.hoisted(() => vi.fn());
15:const toastError = vi.hoisted(() => vi.fn());
16:const toastSuccess = vi.hoisted(() => vi.fn());
17:const fetchRooms = vi.hoisted(() => vi.fn());
18:const openInvoice = vi.hoisted(() => vi.fn());
19:const closeInvoice = vi.hoisted(() => vi.fn());
20:const resetAvailability = vi.hoisted(() => vi.fn());
101:const createReservationError: AppError = {
```

### `mhm/src/components/`
**ReservationSheet.tsx**
```typescript
17:interface Props {
```

### `mhm/src/components/`
**RoomDetailPanel.test.tsx**
```typescript
7:const checkOut = vi.fn();
```

### `mhm/src/components/`
**RoomDetailPanel.tsx**
```typescript
32:interface RoomDetailPanelProps {
```

### `mhm/src/components/`
**RoomDrawer.test.tsx**
```typescript
7:const { invoke } = vi.hoisted(() => ({
```

### `mhm/src/components/`
**RoomDrawer.tsx**
```typescript
32:interface RoomDrawerProps {
```

### `mhm/src/components/shared/`
**ActionBtn.tsx**
```typescript
3:interface ActionBtnProps {
```

### `mhm/src/components/shared/`
**EmptyState.tsx**
```typescript
3:interface EmptyStateProps {
```

### `mhm/src/components/shared/`
**FormField.tsx**
```typescript
3:interface FormFieldProps {
11:export function FormField({
33:interface FormFieldSelectProps {
41:export function FormFieldSelect({
```

### `mhm/src/components/shared/`
**InfoItem.tsx**
```typescript
5:interface InfoItemProps {
```

### `mhm/src/components/shared/`
**PaymentBlock.tsx**
```typescript
1:interface PaymentBlockProps {
```

### `mhm/src/components/shared/`
**RoomGuestsSection.tsx**
```typescript
6:interface RoomGuestsSectionProps {
```

### `mhm/src/components/shared/`
**Section.tsx**
```typescript
5:interface SectionProps {
```

### `mhm/src/components/shared/`
**SlideDrawer.tsx**
```typescript
4:interface SlideDrawerProps {
```

### `mhm/src/components/shared/`
**StatCard.tsx**
```typescript
3:type StatCardLayout = "horizontal" | "vertical" | "centered";
5:interface StatCardProps {
17:const COLOR_MAP: Record<string, string> = {
24:function resolveColors(color?: string, bgColor?: string) {
33:function renderIcon(
```

### `mhm/src/components/shared/`
**StatusBadge.tsx**
```typescript
5:interface StatusBadgeProps {
```

### `mhm/src/components/ui/`
**badge.tsx**
```typescript
7:const badgeVariants = cva(
34:function Badge({
```

### `mhm/src/components/ui/`
**button.tsx**
```typescript
6:const buttonVariants = cva(
43:function Button({
```

### `mhm/src/components/ui/`
**card.tsx**
```typescript
5:function Card({
23:function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
36:function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
49:function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
59:function CardAction({ className, ...props }: React.ComponentProps<"div">) {
72:function CardContent({ className, ...props }: React.ComponentProps<"div">) {
82:function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
```

### `mhm/src/components/ui/`
**input.tsx**
```typescript
6:function Input({ className, type, ...props }: React.ComponentProps<"input">) {
```

### `mhm/src/components/ui/`
**label.tsx**
```typescript
7:function Label({ className, ...props }: React.ComponentProps<"label">) {
```

### `mhm/src/components/ui/`
**Modal.tsx**
```typescript
3:interface ModalProps {
```

### `mhm/src/components/ui/`
**select.tsx**
```typescript
7:const Select = SelectPrimitive.Root
9:function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
19:function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
29:function SelectTrigger({
57:function SelectContent({
96:function SelectLabel({
109:function SelectItem({
137:function SelectSeparator({
150:function SelectScrollUpButton({
169:function SelectScrollDownButton({
```

### `mhm/src/components/ui/`
**sheet.tsx**
```typescript
8:function Sheet({ ...props }: SheetPrimitive.Root.Props) {
12:function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
16:function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
20:function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
24:function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
37:function SheetContent({
81:function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
91:function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
101:function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
111:function SheetDescription({
```

### `mhm/src/components/ui/`
**table.tsx**
```typescript
7:function Table({ className, ...props }: React.ComponentProps<"table">) {
22:function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
32:function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
42:function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
55:function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
68:function TableHead({ className, ...props }: React.ComponentProps<"th">) {
81:function TableCell({ className, ...props }: React.ComponentProps<"td">) {
94:function TableCaption({
```

### `mhm/src/components/`
**UnifiedRoomCard.tsx**
```typescript
6:interface UnifiedRoomCardProps {
15:const QUICK_ACTION_CONFIG: Record<string, { label: string; icon: typeof LogIn; className: string }> = {
```

### `mhm/src/contexts/`
**AppUpdateContext.tsx**
```typescript
5:type AppUpdateContextValue = ReturnType<typeof useAppUpdateController>;
7:const AppUpdateContext = createContext<AppUpdateContextValue | null>(null);
9:export function AppUpdateProvider({
19:export function useAppUpdate() {
```

### `mhm/src/hooks/`
**useAppUpdateController.test.tsx**
```typescript
14:function setUserAgent(value: string) {
```

### `mhm/src/hooks/`
**useAppUpdateController.ts**
```typescript
7:type Update = NonNullable<Awaited<ReturnType<typeof check>>>;
9:interface UseAppUpdateControllerOptions {
16:interface CheckOptions {
20:const DEFAULT_TIMEOUT_MS = 30_000;
22:function isWindows() {
26:function normalizeErrorMessage(error: unknown) {
30:function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
61:function mapInstallFailure(error: unknown): { phase: AppUpdatePhase; message: string } {
71:export function useAppUpdateController({
```

### `mhm/src/hooks/`
**useAvailability.ts**
```typescript
6:interface UseAvailabilityOptions {
14:export function useAvailability({
```

### `mhm/src/hooks/`
**useInvoiceDialog.ts**
```typescript
7:export function useInvoiceDialog() {
```

### `mhm/src/lib/`
**appError.test.ts**
```typescript
3:const { captureCommandFailure } = vi.hoisted(() => ({
```

### `mhm/src/lib/`
**appError.ts**
```typescript
3:export type AppErrorKind = "user" | "system";
5:export interface AppError {
12:export interface AppErrorRegistryEntry {
18:const LAST_RESORT_FALLBACK_ERROR_MESSAGE = "Có lỗi hệ thống, vui lòng thử lại";
20:const registryEntries = errorRegistry as AppErrorRegistryEntry[];
22:export const APP_ERROR_REGISTRY = Object.freeze(
26:export const APP_ERROR_CODE_MAP = Object.freeze(
36:export const APP_ERROR_CODES = APP_ERROR_CODE_MAP;
38:export const SYSTEM_INTERNAL_ERROR = "SYSTEM_INTERNAL_ERROR";
40:const systemInternalErrorDefinition = APP_ERROR_REGISTRY.find(
44:const FALLBACK_ERROR_MESSAGE =
47:export const FALLBACK_SYSTEM_APP_ERROR: AppError = Object.freeze({
54:const APP_ERROR_BY_CODE = Object.freeze(
64:function isRecord(value: unknown): value is Record<string, unknown> {
68:function isAppErrorKind(value: unknown): value is AppErrorKind {
72:function isValidSupportId(value: unknown): value is string | null | undefined {
76:export function getAppErrorDefinition(code: string): AppErrorRegistryEntry | undefined {
80:export function isKnownAppErrorCode(code: string): boolean {
84:export function normalizeAppError(error: unknown): AppError {
108:function getLocalCorrelationId(error: unknown): string | null {
117:export function formatAppError(error: unknown): string {
133:export type NormalizedAppErrorException = Error &
136:export function createAppErrorException(
```

### `mhm/src/lib/`
**appIdentity.test.ts**
```typescript
```

### `mhm/src/lib/`
**appIdentity.ts**
```typescript
1:export const APP_NAME = "CapyInn";
2:export const APP_LOGO_ALT = "CapyInn logo";
3:export const EXPORT_PREFIX = "CapyInn";
4:export const ONBOARDING_DRAFT_KEY = "capyinn-onboarding-draft";
5:export const APP_API_KEY_PREFIX = "capyinn_sk_";
6:export const APP_RUNTIME_DIR = "CapyInn";
7:export const APP_DATABASE_FILENAME = "capyinn.db";
8:export const APP_BUNDLE_IDENTIFIER = "io.capyinn.app";
```

### `mhm/src/lib/`
**constants.ts**
```typescript
3:export const STATUS_LABELS: Record<RoomStatus, string> = {
10:export const STATUS_COLORS: Record<RoomStatus, string> = {
17:export const STATUS_DOT_COLORS: Record<RoomStatus, string> = {
24:export const ROOM_STATUS_CARD_BG: Record<RoomStatus, string> = {
31:export const ROOM_STATUS_TEXT: Record<RoomStatus, string> = {
38:export const ROOM_TYPE_LABELS: Record<string, string> = {
43:export function getRoomTypeLabel(roomType: string): string {
```

### `mhm/src/lib/`
**correlationId.test.ts**
```typescript
```

### `mhm/src/lib/`
**correlationId.ts**
```typescript
1:export function createCorrelationId(): string {
```

### `mhm/src/lib/crashReporting/`
**commandFailure.test.ts**
```typescript
4:const { hasRemoteCrashReporting, submitCommandFailureEvent } = vi.hoisted(() => ({
```

### `mhm/src/lib/crashReporting/`
**commandFailure.ts**
```typescript
9:export type MonitoringContext =
32:const MONITORED_COMMANDS = new Set([
40:function isMonitoredCommand(command: string): boolean {
44:function hasCorrelationId(value: string | null | undefined): value is string {
48:function hasMonitoringContext(value: MonitoringContext | null | undefined): value is MonitoringContext {
52:export interface CaptureCommandFailureInput {
```

### `mhm/src/lib/crashReporting/`
**globalHandlers.test.ts**
```typescript
```

### `mhm/src/lib/crashReporting/`
**globalHandlers.ts**
```typescript
7:function normalizeStacktrace(error: unknown): string[] {
15:function record(report: JsCrashReportInput) {
21:export function installGlobalCrashHandlers() {
```

### `mhm/src/lib/crashReporting/`
**sentry.test.ts**
```typescript
3:const { captureEvent, flush, init } = vi.hoisted(() => ({
```

### `mhm/src/lib/crashReporting/`
**sentry.ts**
```typescript
9:function getSentryDsn(): string {
13:function getSentryRelease(): string {
17:function getSentryEnvironment(): "development" | "production" {
23:export function hasRemoteCrashReporting(): boolean {
27:export interface CommandFailureRemoteEvent {
34:function scrubValue(value: string): string {
40:export function ensureCrashReportingClient() {
```

### `mhm/src/lib/crashReporting/`
**types.ts**
```typescript
1:export interface CrashReportSummary {
16:export interface JsCrashReportInput {
```

### `mhm/src/lib/`
**deferredCleanup.test.ts**
```typescript
```

### `mhm/src/lib/`
**deferredCleanup.ts**
```typescript
1:export function createDeferredCleanup(registration: Promise<() => void>): () => void {
```

### `mhm/src/lib/`
**format.test.ts**
```typescript
```

### `mhm/src/lib/`
**format.ts**
```typescript
1:export function fmtNumber(value: number): string {
5:export function fmtMoney(value: number): string {
9:export function fmtDate(value: string): string {
24:export function fmtDateShort(value: string): string {
```

### `mhm/src/lib/`
**i18n.ts**
```typescript
1:type Locale = "vi" | "en";
3:const translations: Record<string, Record<Locale, string>> = {
85:export function setLocale(locale: Locale) {
90:export function getLocale(): Locale {
94:export function t(key: string): string {
100:export type { Locale };
```

### `mhm/src/lib/`
**invokeCommand.test.ts**
```typescript
3:const invoke = vi.hoisted(() => vi.fn());
4:const captureCommandFailure = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
```

### `mhm/src/lib/`
**invokeCommand.ts**
```typescript
6:export function createIdempotencyKey(command: string): string {
```

### `mhm/src/lib/`
**money.test.ts**
```typescript
```

### `mhm/src/lib/`
**money.ts**
```typescript
3:export type MoneyVnd = number;
5:function moneyValidationError(message: string): Error & AppError {
14:export function assertMoneyVnd(value: number, field: string): MoneyVnd {
21:export function assertNonNegativeMoneyVnd(
32:export function optionalMoneyVnd(
```

### `mhm/src/lib/`
**utils.ts**
```typescript
4:export function cn(...inputs: ClassValue[]) {
```

### `mhm/src/`
**main.tsx**
```typescript
```

### `mhm/src/pages/`
**Analytics.tsx**
```typescript
12:const ROOM_TYPE_COLORS = ["#3B82F6", "#93C5FD"];
14:const fmtShort = (n: number) => {
19:const PERIOD_LABELS: Record<"7d" | "30d" | "90d", string> = {
25:const EMPTY_ANALYTICS: AnalyticsData = {
```

### `mhm/src/pages/`
**Dashboard.tsx**
```typescript
16:const DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
```

### `mhm/src/pages/`
**GroupManagement.test.tsx**
```typescript
17:const fetchGroups = vi.hoisted(() => vi.fn());
18:const getGroupDetail = vi.hoisted(() => vi.fn());
19:const groupCheckout = vi.hoisted(() => vi.fn());
20:const addGroupService = vi.hoisted(() => vi.fn());
21:const removeGroupService = vi.hoisted(() => vi.fn());
22:const generateGroupInvoice = vi.hoisted(() => vi.fn());
23:const toastError = vi.hoisted(() => vi.fn());
24:const toastSuccess = vi.hoisted(() => vi.fn());
105:const checkoutUserError: AppError = {
```

### `mhm/src/pages/`
**GroupManagement.tsx**
```typescript
16:const STATUS_COLORS: Record<string, string> = {
22:const STATUS_LABELS: Record<string, string> = {
28:function getLegacyErrorMessage(error: unknown): string {
```

### `mhm/src/pages/`
**Guests.tsx**
```typescript
```

### `mhm/src/pages/`
**Housekeeping.tsx**
```typescript
```

### `mhm/src/pages/`
**LoginScreen.tsx**
```typescript
```

### `mhm/src/pages/`
**NightAudit.test.tsx**
```typescript
12:const invoke = vi.hoisted(() => vi.fn());
13:const invokeCommand = vi.hoisted(() => vi.fn());
14:const createCorrelationId = vi.hoisted(() => vi.fn());
15:const toastError = vi.hoisted(() => vi.fn());
16:const toastSuccess = vi.hoisted(() => vi.fn());
39:const auditRunError: AppError = {
```

### `mhm/src/pages/`
**NightAudit.tsx**
```typescript
```

### `mhm/src/pages/onboarding/`
**generateRoomPlan.ts**
```typescript
3:const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
5:export function generateRoomPlan(input: {
```

### `mhm/src/pages/onboarding/`
**index.tsx**
```typescript
18:function trimRoomTypeName(name: string) {
22:function hasValidRoomTypes(roomTypes: OnboardingRoomTypeDraft[]) {
42:function syncColumnAssignments(
```

### `mhm/src/pages/onboarding/steps/`
**AppLockStep.tsx**
```typescript
1:type AppLockValue = {
```

### `mhm/src/pages/onboarding/steps/`
**HotelInfoStep.tsx**
```typescript
1:type HotelInfoValue = {
```

### `mhm/src/pages/onboarding/steps/`
**ReviewStep.tsx**
```typescript
```

### `mhm/src/pages/onboarding/steps/`
**RoomLayoutStep.tsx**
```typescript
3:type RoomPlanValue = {
```

### `mhm/src/pages/onboarding/steps/`
**RoomTypesStep.tsx**
```typescript
```

### `mhm/src/pages/onboarding/steps/`
**WelcomeStep.tsx**
```typescript
```

### `mhm/src/pages/onboarding/`
**types.ts**
```typescript
3:export interface OnboardingRoomTypeDraft {
13:export interface OnboardingGeneratedRoom {
24:export interface OnboardingDraft {
```

### `mhm/src/pages/onboarding/`
**useOnboardingDraft.ts**
```typescript
5:export function createRoomTypeDraft(): OnboardingRoomTypeDraft {
17:const DEFAULT_DRAFT: OnboardingDraft = {
42:export function useOnboardingDraft() {
```

### `mhm/src/pages/`
**Reservations.test.tsx**
```typescript
6:const invoke = vi.hoisted(() => vi.fn());
7:const invokeWriteCommand = vi.hoisted(() => vi.fn());
8:const createCorrelationId = vi.hoisted(() => vi.fn());
9:const toastSuccess = vi.hoisted(() => vi.fn());
10:const fetchRooms = vi.hoisted(() => vi.fn());
70:function formatLocalDate(date: Date): string {
77:function bookedReservation() {
```

### `mhm/src/pages/`
**Reservations.tsx**
```typescript
18:type BookingBar = BookingWithGuest & {
26:const DAY_MS = 24 * 60 * 60 * 1000;
28:function startOfLocalDay(date: Date): Date {
32:function formatLocalDate(date: Date): string {
39:function differenceInCalendarDays(left: Date, right: Date): number {
45:function getDateRange(offset: number) {
60:function parseDate(s: string): Date {
70:function getBookingBarColor(status: BookingStatus): string {
77:function getStatusLabel(status: BookingStatus): string {
```

### `mhm/src/pages/`
**Rooms.tsx**
```typescript
93:function StatPill({ icon, label, count, color }: { icon: ReactNode; label: string; count: number; color: string }) {
```

### `mhm/src/pages/settings/`
**AppearanceSection.tsx**
```typescript
```

### `mhm/src/pages/settings/`
**CheckinRulesSection.tsx**
```typescript
9:function readSavedTime(
```

### `mhm/src/pages/settings/`
**DataSection.test.tsx**
```typescript
```

### `mhm/src/pages/settings/`
**DataSection.tsx**
```typescript
```

### `mhm/src/pages/settings/`
**DiagnosticsSection.test.tsx**
```typescript
8:const { toastSuccess, toastError } = vi.hoisted(() => ({
```

### `mhm/src/pages/settings/`
**DiagnosticsSection.tsx**
```typescript
```

### `mhm/src/pages/settings/`
**DynamicRoomTypeSelect.tsx**
```typescript
6:interface DynamicRoomTypeSelectProps {
```

### `mhm/src/pages/settings/`
**GatewaySection.test.tsx**
```typescript
```

### `mhm/src/pages/settings/`
**GatewaySection.tsx**
```typescript
12:type GatewayTool = {
17:export const MCP_TOOLS: GatewayTool[] = [
35:export function buildHttpMcpConfig(status: GatewayStatus | null, apiKey: string | null) {
```

### `mhm/src/pages/settings/`
**HotelInfoSection.tsx**
```typescript
```

### `mhm/src/pages/settings/`
**index.tsx**
```typescript
30:type SettingsSectionKey =
```

### `mhm/src/pages/settings/`
**OcrConfigSection.tsx**
```typescript
```

### `mhm/src/pages/settings/`
**PricingSection.test.tsx**
```typescript
6:const invoke = vi.hoisted(() => vi.fn());
7:const toastError = vi.hoisted(() => vi.fn());
8:const toastSuccess = vi.hoisted(() => vi.fn());
```

### `mhm/src/pages/settings/`
**PricingSection.tsx**
```typescript
153:function Field({ label, children }: { label: string; children: ReactNode }) {
```

### `mhm/src/pages/settings/rate_plans/`
**RatePlanForm.tsx**
```typescript
```

### `mhm/src/pages/settings/`
**RoomConfigSection.tsx**
```typescript
```

### `mhm/src/pages/settings/`
**RoomFormDialog.tsx**
```typescript
10:interface RoomFormDialogProps {
```

### `mhm/src/pages/settings/`
**SoftwareUpdateSection.tsx**
```typescript
```

### `mhm/src/pages/settings/`
**UserManagement.tsx**
```typescript
```

### `mhm/src/pages/settings/`
**useRoomConfig.test.tsx**
```typescript
9:const invokeCommand = vi.hoisted(() => vi.fn());
10:const toastError = vi.hoisted(() => vi.fn());
11:const toastSuccess = vi.hoisted(() => vi.fn());
26:const duplicateRoomError: AppError = {
33:const duplicateRoomTypeError: AppError = {
40:const roomDeleteActiveBookingError: AppError = {
47:const roomNotFoundError: AppError = {
54:const roomTypeInUseError: AppError = {
```

### `mhm/src/pages/settings/`
**useRoomConfig.ts**
```typescript
8:export interface RoomFormValues {
19:const EMPTY_FORM: RoomFormValues = {
```

### `mhm/src/stores/`
**useAuthStore.ts**
```typescript
7:export interface User {
15:interface AuthStore {
29:export const useAuthStore = create<AuthStore>((set, get) => ({
```

### `mhm/src/stores/`
**useHotelStore.test.ts**
```typescript
3:const invoke = vi.hoisted(() => vi.fn());
4:const invokeCommand = vi.hoisted(() => vi.fn());
5:const invokeWriteCommand = vi.hoisted(() => vi.fn());
6:const createIdempotencyKey = vi.hoisted(() => vi.fn());
7:const createCorrelationId = vi.hoisted(() => vi.fn());
```

### `mhm/src/stores/`
**useHotelStore.ts**
```typescript
24:interface HotelStore {
63:export const useHotelStore = create<HotelStore>((set, get) => {
```

### `mhm/src/types/`
**index.ts**
```typescript
3:export type RoomStatus = "vacant" | "occupied" | "cleaning" | "booked";
4:export type BookingStatus =
10:export type BookingSource =
18:export interface Room {
28:export interface Guest {
44:export interface Booking {
60:export type CheckoutSettlementMode = "actual_nights" | "hourly" | "booked_nights";
62:export interface CheckoutSettlementPreview {
69:export interface CheckoutSettlementPayload {
74:export interface RoomWithBooking {
80:export interface DashboardStats {
88:export interface HousekeepingTask {
98:export interface Expense {
107:export interface RevenueStats {
114:export type HotelTab =
125:export interface CheckInGuestInput {
138:export interface CccdInfo {
148:export interface GuestInput {
158:export interface GuestSummary {
168:export type GuestSuggestion = GuestSummary;
170:export interface AvailabilityResult {
176:export interface EditableBooking {
192:export interface RoomTypeItem {
198:export interface ConfigurableRoom extends Room {
203:export interface PricingRuleData {
213:export interface GatewayStatus {
219:export type BackupIndicatorPhase = "saving" | "saved" | "failed";
221:export type AppUpdatePhase =
230:export interface AppUpdateState {
239:export type BackupReason =
248:export type BackupStatusState = "started" | "completed" | "failed";
250:export interface BackupStatusPayload {
259:export interface BootstrapStatus {
265:export interface BookingWithGuest {
285:export interface ActivityItem {
297:export interface ExpenseItem {
302:export interface ChartDataPoint {
307:export interface RoomAvailability {
313:export interface AuditLog {
327:export interface AnalyticsData {
338:export type { CrashReportSummary } from "@/lib/crashReporting/types";
342:export type GroupStatus = "active" | "partial_checkout" | "completed";
344:export interface BookingGroup {
357:export interface GroupService {
370:export interface GroupCheckinRequest {
384:export interface GroupCheckoutRequest {
390:export interface AddGroupServiceRequest {
399:export interface GroupDetailResponse {
409:export interface AutoAssignResult {
413:export interface RoomAssignment {
418:export interface GroupInvoiceData {
432:export interface GroupInvoiceRoomLine {
```

### `mhm/src/`
**vite-env.d.ts**
```typescript
```

### `mhm/src-tauri/src/`
**aggregate_locks.rs**
```rust
9:pub struct AggregateLockManager {
13:pub struct AggregateLockGuard {
18:impl AggregateLockGuard {
24:pub fn room_key(room_id: &str) -> CommandResult<String> {
28:pub fn booking_key(booking_id: &str) -> CommandResult<String> {
32:pub fn folio_key(booking_id: &str) -> CommandResult<String> {
36:pub fn group_key(group_id: &str) -> CommandResult<String> {
40:fn aggregate_key(prefix: &str, id: &str) -> CommandResult<String> {
51:pub fn canonicalize_lock_keys<I, S>(keys: I) -> CommandResult<Vec<String>>
74:impl AggregateLockManager {
106:pub fn global_manager() -> &'static AggregateLockManager {
```

### `mhm/src-tauri/src/`
**app_error.rs**
```rust
86:pub enum AppErrorKind {
92:pub struct CommandError {
104:pub enum CorrelationIdSource {
111:pub struct EffectiveCorrelationId {
117:fn ensure_registered_code(code: &'static str) -> &'static str {
125:impl CommandError {
177:pub fn generate_support_id() -> String {
182:pub fn generate_correlation_id() -> String {
187:fn is_valid_correlation_id(value: &str) -> bool {
196:pub fn normalize_correlation_id(input: Option<String>) -> EffectiveCorrelationId {
216:pub fn correlation_context(correlation_id: &str, context: Value) -> Value {
237:pub fn record_command_failure(
246:pub fn record_command_failure_with_db_group(
281:pub fn log_system_error(
```

### `mhm/src-tauri/src/`
**app_identity.rs**
```rust
10:pub fn runtime_root() -> PathBuf {
14:pub fn runtime_root_opt() -> Option<PathBuf> {
19:pub fn database_path() -> PathBuf {
23:pub fn database_path_opt() -> Option<PathBuf> {
27:pub fn scans_dir() -> PathBuf {
31:pub fn scans_dir_opt() -> Option<PathBuf> {
35:pub fn models_dir() -> PathBuf {
39:pub fn models_dir_opt() -> Option<PathBuf> {
43:pub fn exports_dir() -> PathBuf {
47:pub fn exports_dir_opt() -> Option<PathBuf> {
51:pub fn gateway_lockfile() -> PathBuf {
55:pub fn diagnostics_dir() -> PathBuf {
59:pub fn diagnostics_pending_dir() -> PathBuf {
63:pub fn diagnostics_handled_dir() -> PathBuf {
67:pub fn diagnostics_install_id_path() -> PathBuf {
71:pub fn crash_report_exports_dir() -> PathBuf {
75:pub fn gateway_lockfile_opt() -> Option<PathBuf> {
```

### `mhm/src-tauri/src/backup/`
**coordinator.rs**
```rust
12:pub struct BackupCoordinator {
20:impl BackupCoordinator {
```

### `mhm/src-tauri/src/backup/`
**events.rs**
```rust
7:pub struct BackupStatusPayload {
18:impl BackupStatusPayload {
```

### `mhm/src-tauri/src/backup/`
**mod.rs**
```rust
```

### `mhm/src-tauri/src/backup/`
**runner.rs**
```rust
8:fn backup_timestamp_now() -> NaiveDateTime {
14:fn retention_timestamp_now() -> NaiveDateTime {
```

### `mhm/src-tauri/src/backup/`
**scheduler.rs**
```rust
13:fn scheduled_backup_interval_chrono() -> ChronoDuration {
18:fn scheduler_now() -> NaiveDateTime {
24:pub struct BackupSchedulerHandle {
29:impl BackupSchedulerHandle {
57:pub fn start_backup_scheduler(app: AppHandle) -> BackupSchedulerHandle {
```

### `mhm/src-tauri/src/backup/`
**storage.rs**
```rust
9:struct BackupMetadata {
16:enum BackupRetentionGroup {
21:impl BackupRetentionGroup {
42:impl BackupMetadata {
52:pub fn build_backup_filename(reason: BackupReason, timestamp: NaiveDateTime) -> String {
60:pub fn is_managed_backup_file(name: &str) -> bool {
108:impl BackupReservation {
154:impl Drop for BackupReservation {
164:pub fn prune_old_backups(backup_dir: &Path, now: NaiveDateTime) -> BackupPruneOutcome {
244:fn reservation_lock_path(final_path: &Path) -> PathBuf {
258:fn parse_backup_filename(name: &str) -> Option<BackupMetadata> {
280:fn parse_backup_reason(reason: &str) -> Option<BackupReason> {
```

### `mhm/src-tauri/src/backup/`
**test_support.rs**
```rust
24:impl Drop for TempDirGuard {
30:impl BackupFixture {
```

### `mhm/src-tauri/src/backup/`
**types.rs**
```rust
4:pub enum BackupReason {
14:impl BackupReason {
30:pub struct BackupOutcome {
37:pub struct BackupPruneOutcome {
45:pub enum BackupError {
51:pub enum BackupRequestErrorKind {
57:pub enum BackupRequestError {
64:impl From<io::Error> for BackupError {
70:impl From<sqlx::Error> for BackupError {
76:impl BackupRequestError {
87:impl fmt::Display for BackupError {
96:impl std::error::Error for BackupError {}
98:impl fmt::Display for BackupRequestError {
111:impl std::error::Error for BackupRequestError {}
113:pub fn log_backup_request_error(context: &str, error: &BackupRequestError) {
```

### `mhm/src-tauri/src/bin/`
**restore_drill.rs**
```rust
27:fn parse_args<I>(args: I) -> Result<RestoreDrillOptions, String>
```

### `mhm/src-tauri/src/bin/`
**test_ocr.rs**
```rust
3:fn main() {
```

### `mhm/src-tauri/src/`
**command_failure_log.rs**
```rust
14:pub struct CommandFailureRecord {
27:impl CommandFailureRecord {
51:pub fn command_failure_log_path(runtime_root: &Path) -> PathBuf {
57:fn append_mutex() -> &'static Mutex<()> {
62:pub fn append_command_failure_record(
```

### `mhm/src-tauri/src/`
**command_idempotency.rs**
```rust
24:pub enum ActorType {
32:pub struct WriteCommandContext {
45:pub struct IdempotentCommandResult<T> {
51:pub struct LedgerAggregateRef {
59:pub struct CommandLedgerSummary {
67:pub struct SanitizedLedgerIntent {
72:pub struct CommandLedgerResultSummary {
77:pub struct CommandLedgerErrorSummary {
101:impl CommandLedgerSummary {
170:impl SanitizedLedgerIntent {
200:impl CommandLedgerResultSummary {
214:impl CommandLedgerErrorSummary {
257:fn validate_safe_key(value: String) -> CommandResult<String> {
264:fn validate_safe_text(value: String) -> CommandResult<String> {
276:fn contains_forbidden_safe_term(value: &str) -> bool {
299:fn split_case_boundaries(value: &str) -> String {
314:fn contains_sensitive_numeric_sequence(value: &str) -> bool {
318:fn validate_safe_value(value: serde_json::Value) -> CommandResult<serde_json::Value> {
349:pub struct ResolvedWriteCommandGuard<T> {
354:impl<T> ResolvedWriteCommandGuard<T> {
368:pub struct WriteCommandRequest {
379:pub enum CommandStatus {
386:impl CommandStatus {
409:impl WriteCommandRequest {
455:pub fn default_lock_key_deriver(_intent: &serde_json::Value) -> CommandResult<Vec<String>> {
459:fn actor_type_as_str(actor_type: ActorType) -> &'static str {
468:fn sanitized_intent_from_value(value: serde_json::Value) -> CommandResult<SanitizedLedgerIntent> {
475:pub struct WriteCommandExecutor {
479:enum ClaimOutcome {
484:struct PreparedWriteCommandRequest {
493:impl WriteCommandExecutor {
1153:fn lease_refresh_error_is_transient(error: &sqlx::Error) -> bool {
1158:impl WriteCommandContext {
1248:fn canonicalize_json_value(value: serde_json::Value) -> serde_json::Value {
1271:fn stable_json_string(value: &serde_json::Value) -> CommandResult<String> {
1280:fn stable_request_hash_from_json(intent_json: &str) -> CommandResult<String> {
1285:fn prepare_write_command_request(
1404:fn existing_claim_is_reclaimable(
1433:fn resolve_existing_claim_row(
```

### `mhm/src-tauri/src/`
**command_ledger.rs**
```rust
14:pub struct CommandLedgerListOptions {
26:pub struct CommandLedgerSource {
33:pub struct CommandLedgerListItem {
51:pub struct CommandLedgerDetail {
216:fn bounded_limit(limit: Option<i64>) -> i64 {
220:fn bounded_offset(offset: Option<i64>) -> i64 {
224:fn validate_status_filter(status: Option<&str>) -> CommandResult<()> {
234:fn validate_attention_reason_filter(reason: Option<&str>) -> CommandResult<()> {
244:fn attention_reason(status: &str, lease_expires_at: Option<&str>, now: &str) -> Option<String> {
255:fn parse_json(raw: Option<String>) -> serde_json::Value {
260:fn parse_optional_json(raw: Option<String>) -> Option<serde_json::Value> {
264:fn source_from_row(row: &SqliteRow) -> CommandLedgerSource {
280:fn safe_actor_label(value: String) -> Option<String> {
293:fn contains_sensitive_numeric_sequence(value: &str) -> bool {
297:fn contains_forbidden_source_label_term(value: &str) -> bool {
314:fn split_source_case_boundaries(value: &str) -> String {
329:fn conflict_refs_from_summary(summary: &serde_json::Value) -> Vec<serde_json::Value> {
337:fn list_item_from_row(row: SqliteRow, now: &str) -> CommandResult<CommandLedgerListItem> {
359:fn detail_from_row(row: SqliteRow, now: &str) -> CommandResult<CommandLedgerDetail> {
390:fn system_error(error: impl std::fmt::Display) -> CommandError {
```

### `mhm/src-tauri/src/commands/`
**analytics.rs**
```rust
137:fn extract_time(datetime_str: &str) -> String {
```

### `mhm/src-tauri/src/commands/`
**audit.rs**
```rust
23:fn log_user_audit_error(
45:fn map_audit_user_error(
61:fn record_audit_auth_error(
81:fn map_audit_error(
173:fn audit_failure_context(audit_date: &str, notes: Option<&str>) -> Value {
```

### `mhm/src-tauri/src/commands/`
**auth.rs**
```rust
```

### `mhm/src-tauri/src/commands/`
**billing.rs**
```rust
15:fn require_add_folio_line_actor_id(user_id: Option<String>) -> CommandResult<String> {
19:fn add_folio_line_write_command_context(
```

### `mhm/src-tauri/src/commands/`
**bookings.rs**
```rust
```

### `mhm/src-tauri/src/commands/`
**command_ledger.rs**
```rust
```

### `mhm/src-tauri/src/commands/`
**diagnostics.rs**
```rust
```

### `mhm/src-tauri/src/commands/`
**groups.rs**
```rust
21:fn log_group_user_error(
44:fn map_group_user_error(
61:fn map_known_group_error_code(
96:fn map_group_error(
197:fn map_auto_assign_error(command_name: &str, message: String, context: Value) -> CommandError {
207:fn map_group_detail_error(group_id: &str, error: sqlx::Error) -> CommandError {
221:fn require_group_checkin_actor_id(user_id: Option<String>) -> CommandResult<String> {
225:fn group_checkin_write_command_context(
```

### `mhm/src-tauri/src/commands/`
**guests.rs**
```rust
```

### `mhm/src-tauri/src/commands/`
**invoices.rs**
```rust
```

### `mhm/src-tauri/src/commands/`
**mod.rs**
```rust
42:pub struct AppState {
73:impl From<CommandError> for String {
```

### `mhm/src-tauri/src/commands/`
**onboarding.rs**
```rust
9:fn sync_bootstrap_session(current_user: &Arc<Mutex<Option<User>>>, status: &BootstrapStatus) {
```

### `mhm/src-tauri/src/commands/`
**pricing.rs**
```rust
50:fn validate_pricing_rule_money(
```

### `mhm/src-tauri/src/commands/`
**reservations.rs**
```rust
115:fn log_user_reservation_error(
137:fn map_create_reservation_user_error(
154:fn map_known_reservation_error_code(
195:fn map_reservation_write_error(
325:fn map_create_reservation_error(
334:fn reservation_failure_context(req: &CreateReservationRequest) -> Value {
352:fn reservation_booking_failure_context(booking_id: &str) -> Value {
358:fn modify_reservation_failure_context(req: &ModifyReservationRequest) -> Value {
367:fn unauthenticated_create_reservation_error(
381:fn map_create_reservation_command_error_db_group(
392:fn record_create_reservation_command_failure(
```

### `mhm/src-tauri/src/commands/`
**room_management.rs**
```rust
436:fn is_unique_constraint_error(error: &sqlx::Error) -> bool {
```

### `mhm/src-tauri/src/commands/`
**rooms.rs**
```rust
70:fn log_user_stay_error(
93:fn map_stay_user_error(
110:fn map_known_stay_error_code(
139:fn map_stay_error(
307:fn check_in_failure_context(req: &CheckInRequest) -> Value {
323:fn check_out_failure_context(req: &CheckOutRequest) -> Value {
331:fn extend_stay_failure_context(booking_id: &str) -> Value {
338:fn should_request_checkout_backup(replayed: bool) -> bool {
838:fn validate_create_expense_request(req: &CreateExpenseRequest) -> Result<(), String> {
```

### `mhm/src-tauri/src/commands/`
**settings.rs**
```rust
```

### `mhm/src-tauri/src/`
**crash_index.rs**
```rust
12:pub enum CrashIndexState {
19:pub struct CrashIndexRow {
29:pub fn crash_index_path(runtime_root: &Path) -> PathBuf {
33:pub fn rebuild_crash_index_for(runtime_root: &Path) -> Result<PathBuf, String> {
61:pub fn rebuild_current_runtime_root() -> Result<PathBuf, String> {
65:fn scan_bundle_dir(dir: &Path, state: CrashIndexState) -> Result<Vec<CrashIndexRow>, String> {
77:fn scan_handled_dir(dir: &Path) -> Result<Vec<CrashIndexRow>, String> {
101:fn read_json_entries(dir: &Path) -> Result<Vec<PathBuf>, String> {
117:fn collect_json_entries<I>(entries: I, dir: &Path) -> Result<Vec<PathBuf>, String>
141:fn read_bundle_row(path: &Path, state: CrashIndexState) -> Result<Option<CrashIndexRow>, String> {
176:fn parse_occurred_at(value: &str) -> Option<DateTime<FixedOffset>> {
180:fn bundle_to_row(bundle: CrashBundle, state: CrashIndexState) -> CrashIndexRow {
192:fn compare_rows_newest_first(left: &CrashIndexRow, right: &CrashIndexRow) -> std::cmp::Ordering {
```

### `mhm/src-tauri/src/`
**db_error_monitoring.rs**
```rust
10:pub enum DbErrorGroup {
19:pub enum MonitoredDbFailure<'a> {
25:pub fn classify_db_failure(failure: MonitoredDbFailure<'_>) -> DbErrorGroup {
37:pub fn classify_db_error_code(message: &str) -> Option<&'static str> {
67:pub fn is_room_unavailable_conflict_message(message: &str) -> bool {
83:fn classify_message(message: &str) -> Option<DbErrorGroup> {
102:pub fn inject_db_error_group(context: Value, group: DbErrorGroup) -> Value {
```

### `mhm/src-tauri/src/`
**db.rs**
```rust
112:fn sqlite_pragma_mismatch(name: &str, expected: &str, actual: i64) -> sqlx::Error {
191:fn is_duplicate_column_error(error: &sqlx::Error) -> bool {
```

### `mhm/src-tauri/src/`
**diagnostics.rs**
```rust
15:pub struct CrashBundle {
31:pub struct JsCrashReportInput {
40:fn ensure_dir(path: &Path) -> Result<(), String> {
44:fn validate_bundle_id(bundle_id: &str) -> Result<&str, String> {
56:fn bundle_path(root: &Path, bundle_id: &str) -> Result<PathBuf, String> {
61:fn handled_bundle_path(root: &Path, bundle_id: &str, disposition: &str) -> Result<PathBuf, String> {
66:fn export_path_for(root: &Path, bundle_id: &str) -> Result<PathBuf, String> {
74:fn json_file_entries(dir: &Path) -> Result<Vec<DirEntry>, String> {
93:fn read_bundle_from_path(path: &Path) -> Result<CrashBundle, String> {
98:fn write_bundle_to_path(path: &Path, bundle: &CrashBundle) -> Result<(), String> {
103:fn quarantine_corrupt_bundle(root: &Path, entry: &DirEntry) -> Result<(), String> {
115:fn scrub_runtime_paths(text: &str) -> String {
130:fn os_name() -> &'static str {
134:pub fn build_rust_panic_bundle(app_version: &str, environment: &str, message: &str) -> CrashBundle {
159:fn build_js_crash_bundle(root: &Path, report: JsCrashReportInput) -> Result<CrashBundle, String> {
184:fn panic_message(payload: &(dyn std::any::Any + Send)) -> Cow<'_, str> {
194:pub fn load_or_create_install_id(root: &Path) -> Result<String, String> {
213:pub fn pending_dir_for(root: &Path) -> PathBuf {
217:pub fn handled_dir_for(root: &Path) -> PathBuf {
221:pub fn write_pending_bundle_for(root: &Path, bundle: &CrashBundle) -> Result<PathBuf, String> {
229:fn write_pending_bundle_and_refresh_index_for(
246:pub fn read_oldest_pending_bundle_for(root: &Path) -> Result<Option<CrashBundle>, String> {
257:pub fn mark_bundle_handled_for(
268:pub fn mark_bundle_send_failed_for(root: &Path, bundle_id: &str) -> Result<(), String> {
275:pub fn export_bundle_for(root: &Path, bundle_id: &str) -> Result<PathBuf, String> {
301:pub fn prune_handled_bundles_for(root: &Path, max_entries: usize) -> Result<(), String> {
313:fn mark_bundle_handled_and_refresh_index_for(
333:pub fn install_panic_hook(app_version: &'static str, environment: &'static str) {
360:pub fn record_js_crash(report: JsCrashReportInput) -> Result<(), String> {
367:pub fn get_pending_crash_report() -> Result<Option<CrashBundle>, String> {
371:pub fn mark_crash_report_submitted(bundle_id: &str) -> Result<(), String> {
376:pub fn mark_crash_report_dismissed(bundle_id: &str) -> Result<(), String> {
381:pub fn mark_crash_report_send_failed(bundle_id: &str) -> Result<(), String> {
385:pub fn export_crash_report(bundle_id: &str) -> Result<PathBuf, String> {
```

### `mhm/src-tauri/src/domain/booking/`
**error.rs**
```rust
4:pub enum BookingError {
15:impl BookingError {
41:impl fmt::Display for BookingError {
54:impl std::error::Error for BookingError {}
56:impl From<sqlx::Error> for BookingError {
```

### `mhm/src-tauri/src/domain/booking/`
**mod.rs**
```rust
```

### `mhm/src-tauri/src/domain/booking/`
**origin.rs**
```rust
4:pub struct OriginSideEffect {
9:impl OriginSideEffect {
```

### `mhm/src-tauri/src/domain/booking/`
**pricing.rs**
```rust
8:struct StayPricingInputs {
19:struct StoredPricingRule {
33:impl StoredPricingRule {
51:fn build_effective_pricing_rule(inputs: &StayPricingInputs) -> crate::pricing::PricingRule {
68:fn calculate_from_loaded_inputs(
84:fn stored_rule_from_row(row: &sqlx::sqlite::SqliteRow) -> StoredPricingRule {
308:fn read_f64(row: &sqlx::sqlite::SqliteRow, column: &str) -> f64 {
313:fn read_money_vnd(row: &sqlx::sqlite::SqliteRow, column: &str) -> MoneyVnd {
```

### `mhm/src-tauri/src/domain/`
**mod.rs**
```rust
```

### `mhm/src-tauri/src/gateway/`
**auth.rs**
```rust
11:pub fn generate_api_key() -> (String, String) {
26:pub fn hash_key(key: &str) -> String {
```

### `mhm/src-tauri/src/gateway/`
**mod.rs**
```rust
37:pub fn cleanup_lockfile() {
43:pub fn live_port_from_lockfile() -> Option<u16> {
48:fn cleanup_stale_lockfile() {
52:fn write_lockfile(lockfile: &Path, port: u16) -> Result<(), String> {
62:fn cleanup_lockfile_path(lockfile: &Path) {
66:fn live_port_from_lockfile_path(lockfile: &Path) -> Option<u16> {
76:fn read_port_from_lockfile_path(lockfile: &Path) -> Option<u16> {
81:fn is_port_live(port: u16) -> bool {
```

### `mhm/src-tauri/src/gateway/`
**models.rs**
```rust
9:pub struct CheckAvailabilityInput {
19:pub struct GetRoomDetailInput {
25:pub struct GetSettingsInput {
31:pub struct GetBookingsInput {
41:pub struct CalculatePriceInput {
53:pub struct CreateReservationInput {
77:pub struct CancelReservationInput {
83:pub struct ModifyReservationInput {
95:pub struct GetInvoiceInput {
```

### `mhm/src-tauri/src/gateway/`
**policy.rs**
```rust
9:pub enum RiskLevel {
16:pub struct WriteToolMeta {
59:pub struct McpToolErrorEnvelope {
65:pub struct McpToolError {
75:impl McpToolErrorEnvelope {
99:pub fn high_risk_mcp_writes_enabled() -> bool {
103:pub fn guard_write_tool(meta: &WriteToolMeta) -> Result<(), McpToolErrorEnvelope> {
```

### `mhm/src-tauri/src/gateway/`
**proxy.rs**
```rust
9:pub fn run_proxy() {
76:fn read_port_from_lockfile() -> Option<u16> {
81:fn send_error(message: &str) {
```

### `mhm/src-tauri/src/gateway/`
**server.rs**
```rust
65:pub struct RunningGatewayServer {
```

### `mhm/src-tauri/src/gateway/`
**tools.rs**
```rust
24:fn hotel_info_field_from_json(json_str: &str, field: &str) -> Option<String> {
58:fn preview_date(value: &str) -> &str {
62:fn format_invoice_text(inv: &InvoiceData) -> String {
105:pub struct HotelTools {
112:fn gateway_tool_args_hash<T: Serialize>(args: &T) -> CommandResult<String> {
117:fn mcp_request_id_string(request_id: &McpRequestId) -> String {
124:fn tool_success_envelope<T: Serialize>(data: &T) -> String {
132:fn tool_error_envelope(tool: &str, request_id: &str, error: CommandError) -> String {
954:impl HotelTools {
985:impl HotelTools {
1298:impl ServerHandler for HotelTools {
```

### `mhm/src-tauri/src/`
**lib.rs**
```rust
38:struct GatewayRuntimeState {
44:impl GatewayRuntimeState {
89:fn init_logging() {
97:fn write_smoke_ready_file() -> Result<(), String> {
114:fn updater_enabled_from_env(debug_build: bool, env_enabled: bool) -> bool {
118:fn updater_enabled() -> bool {
125:fn spawn_crash_index_rebuild() {
134:pub fn run() {
340:pub fn run_proxy() {
```

### `mhm/src-tauri/src/`
**main.rs**
```rust
4:fn main() {
```

### `mhm/src-tauri/src/`
**models.rs**
```rust
30:pub struct Room {
44:pub struct RoomType {
51:pub struct BootstrapStatus {
58:pub struct OnboardingRoomTypeInput {
68:pub struct OnboardingRoomInput {
80:pub struct CreateRoomRequest {
92:pub struct CreateRoomTypeRequest {
97:pub struct OnboardingHotelInfoInput {
108:pub struct OnboardingAppLockInput {
115:pub struct OnboardingCompleteRequest {
123:pub struct Guest {
139:pub struct Booking {
156:pub struct Expense {
166:pub struct HousekeepingTask {
179:pub struct CreateGuestRequest {
193:pub struct CheckInRequest {
205:pub enum CheckoutSettlementMode {
212:pub struct CheckOutRequest {
219:pub struct CheckOutResponse {
228:pub struct CheckoutSettlementPreviewRequest {
234:pub struct CheckoutSettlementPreview {
242:pub struct RoomWithBooking {
249:pub struct CreateExpenseRequest {
257:pub struct DashboardStats {
266:pub struct RevenueStats {
274:pub struct FolioLine {
285:pub struct RecordPaymentResponse {
293:pub struct AuditLog {
308:pub struct NightAuditSnapshot {
320:pub struct BookingExportRow {
344:pub struct BookingWithGuest {
365:pub struct BookingFilter {
372:pub struct GuestSummary {
383:pub struct BookingWithRoom {
393:pub struct GuestHistoryResponse {
399:pub struct SourceRevenue {
405:pub struct CategoryExpense {
411:pub struct RoomRevenue {
417:pub struct AnalyticsData {
429:pub struct DailyRevenue {
435:pub struct ActivityItem {
448:pub struct UpdateRoomRequest {
462:pub struct User {
471:pub struct LoginRequest {
476:pub struct LoginResponse {
481:pub struct CreateUserRequest {
490:pub struct CreateReservationRequest {
504:pub struct ModifyReservationRequest {
512:pub struct AvailabilityResult {
519:pub struct CalendarConflict {
527:pub struct CalendarEntry {
535:pub struct RoomWithAvailability {
543:pub struct UpcomingReservation {
555:pub struct InvoiceData {
583:pub struct BookingGroup {
597:pub struct GroupService {
611:pub struct GroupCheckinRequest {
626:pub struct GroupCheckoutRequest {
633:pub struct GroupCheckoutResponse {
642:pub struct AddGroupServiceRequest {
652:pub struct GroupDetailResponse {
663:pub struct AutoAssignRequest {
669:pub struct AutoAssignResult {
674:pub struct RoomAssignment {
680:pub struct GroupInvoiceData {
695:pub struct GroupInvoiceRoomLine {
```

### `mhm/src-tauri/src/`
**money_migration.rs**
```rust
13:impl MoneyMigrationIssue {
20:struct MoneyColumn {
27:struct MoneyTable {
33:struct JsonColumn {
343:fn read_sqlite_money_value(row: &sqlx::sqlite::SqliteRow, column: &str) -> Option<f64> {
349:fn validate_legacy_money_value(value: Option<f64>) -> Result<MoneyVnd, String> {
597:fn convert_json_money_value(
648:fn validate_json_money_value(value: &Value) -> Result<Option<MoneyVnd>, String> {
663:fn validate_money_i128(value: i128) -> Result<MoneyVnd, String> {
671:fn rewrite_create_table_sql(
696:fn rewrite_column_definition(definition: &str, money_columns: &HashSet<&str>) -> String {
720:fn split_table_definitions(body: &str) -> Vec<String> {
760:fn parse_identifier(value: &str) -> Option<(String, usize)> {
868:fn read_row_id(row: &sqlx::sqlite::SqliteRow) -> String {
877:fn json_child_path(parent: &str, key: &str) -> String {
891:fn quote_identifier(identifier: &str) -> String {
895:fn quote_sql_literal(value: &str) -> String {
```

### `mhm/src-tauri/src/`
**money.rs**
```rust
8:pub fn validate_transport_money_vnd(value: MoneyVnd, field: &str) -> CommandResult<MoneyVnd> {
18:pub fn validate_non_negative_money_vnd(value: MoneyVnd, field: &str) -> CommandResult<MoneyVnd> {
29:pub fn percentage_money_line(base: MoneyVnd, pct: f64, field: &str) -> CommandResult<MoneyVnd> {
73:fn round_ratio_half_away_from_zero(numerator: i128, denominator: i128) -> Option<i128> {
```

### `mhm/src-tauri/src/`
**ocr.rs**
```rust
11:pub struct CccdInfo {
22:pub fn find_models_dir() -> Result<PathBuf, String> {
52:pub fn create_engine() -> Result<OcrEngine, String> {
75:pub fn ocr_image(engine: &OcrEngine, image_path: &Path) -> Result<Vec<String>, String> {
92:pub fn parse_cccd(lines: &[String]) -> CccdInfo {
136:fn extract_field_value(lines: &[String], labels: &[&str]) -> Option<String> {
161:pub struct OcrEngineWrapper(pub Mutex<OcrEngine>);
```

### `mhm/src-tauri/src/`
**pricing.rs**
```rust
19:pub struct PricingRule {
33:impl Default for PricingRule {
52:pub struct PricingResult {
63:pub struct PricingLine {
72:pub fn calculate_price(
109:fn calculate_nightly(
150:fn calculate_hourly(
230:fn calculate_overnight(
328:fn calculate_daily(
419:fn calculate_weekend_uplift(
449:fn checked_mul_money(amount: MoneyVnd, multiplier: i64, field: &str) -> Result<MoneyVnd, String> {
456:fn checked_add_money(a: MoneyVnd, b: MoneyVnd, field: &str) -> Result<MoneyVnd, String> {
463:fn sum_lines(lines: &[PricingLine], field: &str) -> Result<MoneyVnd, String> {
472:fn has_explicit_time(s: &str) -> bool {
477:fn parse_datetime(s: &str) -> Option<NaiveDateTime> {
496:fn parse_time(s: &str) -> NaiveTime {
500:fn fmt_vnd(amount: MoneyVnd) -> String {
```

### `mhm/src-tauri/src/queries/booking/`
**audit_queries.rs**
```rust
```

### `mhm/src-tauri/src/queries/booking/`
**billing_queries.rs**
```rust
```

### `mhm/src-tauri/src/queries/booking/`
**mod.rs**
```rust
```

### `mhm/src-tauri/src/queries/booking/`
**revenue_queries.rs**
```rust
336:fn normalize_date(value: &str) -> NaiveDate {
362:fn recognized_room_revenue_amount_sql(column_prefix: &str) -> String {
378:fn recognized_room_revenue_filter_sql(column_prefix: &str) -> String {
```

### `mhm/src-tauri/src/queries/`
**mod.rs**
```rust
```

### `mhm/src-tauri/src/repositories/booking/`
**folio_repository.rs**
```rust
```

### `mhm/src-tauri/src/repositories/booking/`
**mod.rs**
```rust
```

### `mhm/src-tauri/src/repositories/booking/`
**night_audit_repository.rs**
```rust
```

### `mhm/src-tauri/src/repositories/`
**mod.rs**
```rust
```

### `mhm/src-tauri/src/`
**restore_drill.rs**
```rust
39:pub struct RestoreDrillOptions {
46:pub enum RestoreDrillStatus {
51:impl RestoreDrillStatus {
61:pub struct RestoreDrillRun {
70:impl RestoreDrillRun {
80:pub struct RestoreDrillCheck {
87:enum CheckStatus {
93:impl CheckStatus {
104:struct ManagedBackup {
112:struct TempWorkspace {
116:impl Drop for TempWorkspace {
188:struct FinishRunInput {
197:fn finish_run(input: FinishRunInput) -> RestoreDrillRun {
246:fn select_backup(
267:fn select_newest_managed_backup(runtime_root: &Path) -> Result<ManagedBackup, String> {
307:fn compare_backup(left: (NaiveDateTime, u64, &str), right: (NaiveDateTime, u64, &str)) -> bool {
315:fn candidate_key(candidate: &ManagedBackup) -> (NaiveDateTime, u64, &str) {
323:fn backup_dir_read_error(backup_dir: &Path, error: io::Error) -> String {
334:struct ParsedBackupName {
339:fn parse_managed_backup_file_name(name: &str) -> Option<ParsedBackupName> {
574:fn create_temp_workspace(now: NaiveDateTime) -> io::Result<TempWorkspace> {
594:fn write_report(runtime_root: &Path, now: NaiveDateTime, report: &str) -> io::Result<PathBuf> {
627:fn render_report(
678:fn escape_markdown_table(value: &str) -> String {
682:fn pass_check(name: impl Into<String>, detail: impl Into<String>) -> RestoreDrillCheck {
690:fn fail_check(name: impl Into<String>, detail: impl Into<String>) -> RestoreDrillCheck {
699:fn warn_check(name: impl Into<String>, detail: impl Into<String>) -> RestoreDrillCheck {
707:fn drill_timestamp_now() -> NaiveDateTime {
713:fn is_live_database_path(path: &Path, runtime_root: &Path) -> bool {
718:fn comparable_path(path: &Path) -> PathBuf {
```

### `mhm/src-tauri/src/`
**runtime_config.rs**
```rust
4:pub fn env_flag(name: &str) -> bool {
16:pub fn runtime_root_override() -> Option<PathBuf> {
22:pub fn test_now() -> Option<DateTime<FixedOffset>> {
28:pub fn smoke_ready_file() -> Option<PathBuf> {
35:pub fn env_lock() -> &'static std::sync::Mutex<()> {
```

### `mhm/src-tauri/src/services/booking/`
**audit_service.rs**
```rust
14:fn mark_write_db_error(error: BookingError) -> BookingError {
```

### `mhm/src-tauri/src/services/booking/`
**billing_service.rs**
```rust
19:fn validate_whole_positive_vnd(amount: MoneyVnd) -> BookingResult<MoneyVnd> {
29:fn validate_whole_vnd(amount: MoneyVnd, field: &str) -> BookingResult<MoneyVnd> {
63:fn map_add_folio_line_command_error(error: BookingError) -> CommandError {
92:fn add_folio_line_lock_keys_from_payload(
188:fn map_record_payment_command_error(error: BookingError) -> CommandError {
```

### `mhm/src-tauri/src/services/booking/`
**group_lifecycle.rs**
```rust
36:fn allocate_positive_money_evenly(total: MoneyVnd, count: usize) -> Vec<MoneyVnd> {
48:fn allocate_positive_money_evenly_by_room(
60:fn map_group_checkin_command_error(error: BookingError) -> CommandError {
95:fn normalized_room_ids(room_ids: &[String]) -> Vec<String> {
101:fn build_group_checkin_hash_payload(req: &GroupCheckinRequest) -> serde_json::Value {
147:fn group_checkin_lock_keys_from_payload(
166:struct ExistingGroupCheckinCommandContext {
211:fn build_group_checkin_payment_origins(
590:fn normalized_booking_ids(booking_ids: &[String]) -> Vec<String> {
601:fn validate_group_checkout_request(req: &GroupCheckoutRequest) -> BookingResult<()> {
614:fn map_group_checkout_command_error(error: BookingError) -> CommandError {
646:fn build_group_checkout_hash_payload(req: &GroupCheckoutRequest) -> serde_json::Value {
655:fn group_checkout_initial_lock_keys_from_payload(
666:struct GroupCheckoutLockState {
672:struct GroupCheckoutResolvedGuard {
1091:fn validate_group_checkin_request(req: &GroupCheckinRequest) -> BookingResult<()> {
1290:fn parse_date(value: &str) -> BookingResult<NaiveDate> {
```

### `mhm/src-tauri/src/services/booking/`
**guest_service.rs**
```rust
9:pub struct GuestManifest {
14:struct GuestRecordInput<'a> {
```

### `mhm/src-tauri/src/services/booking/`
**mod.rs**
```rust
```

### `mhm/src-tauri/src/services/booking/`
**reservation_lifecycle.rs**
```rust
38:pub struct ReservationCancelResponse {
43:fn mark_write_db_error(error: BookingError) -> BookingError {
50:fn map_known_reservation_command_error(message: &str) -> Option<CommandError> {
66:fn map_create_reservation_command_error(error: BookingError) -> CommandError {
97:fn map_reservation_command_error(error: BookingError) -> CommandError {
142:fn create_room_lock_keys(intent: &serde_json::Value) -> CommandResult<Vec<String>> {
150:fn reservation_booking_lock_keys(intent: &serde_json::Value) -> CommandResult<Vec<String>> {
158:struct ReservationResolvedGuard {
205:fn command_origin_key(ctx: &WriteCommandContext) -> String {
971:fn validate_requested_nights(
1083:struct BookedReservation {
1090:fn parse_date(value: &str) -> BookingResult<NaiveDate> {
```

### `mhm/src-tauri/src/services/booking/`
**stay_lifecycle.rs**
```rust
39:fn mark_write_db_error(error: BookingError) -> BookingError {
46:fn ensure_locked_room_matches_booking(
58:fn map_check_in_command_error(error: BookingError) -> CommandError {
85:fn map_check_out_command_error(error: BookingError) -> CommandError {
114:fn map_extend_stay_command_error(error: BookingError) -> CommandError {
141:fn build_check_in_hash_payload(req: &CheckInRequest) -> serde_json::Value {
173:fn build_check_out_hash_payload(req: &CheckOutRequest) -> serde_json::Value {
182:fn build_extend_stay_hash_payload(booking_id: &str) -> serde_json::Value {
190:fn check_in_lock_keys_from_payload(hash_payload: &serde_json::Value) -> CommandResult<Vec<String>> {
198:fn check_out_initial_lock_keys_from_payload(
211:fn extend_stay_initial_lock_keys_from_payload(
521:struct CheckoutSettlementComputation {
533:fn settlement_mode_label(mode: CheckoutSettlementMode) -> &'static str {
541:fn actual_nights_for_checkout(
551:fn settlement_boundary_for(check_in_at: &str, settled_nights: i32) -> BookingResult<String> {
556:fn reporting_checkout_for(
582:fn settlement_explanation(
609:fn checkout_settlement_snapshot(
1224:fn validate_check_in_request(req: &CheckInRequest) -> BookingResult<()> {
```

### `mhm/src-tauri/src/services/booking/`
**support.rs**
```rust
20:pub fn invalid_state_transition(message: impl AsRef<str>) -> BookingError {
28:pub fn ensure_one_row_affected(
39:pub fn ensure_rows_affected(
62:pub fn rfc3339_now() -> String {
66:pub fn parse_booking_datetime(value: &str) -> BookingResult<DateTime<FixedOffset>> {
151:pub fn read_money_vnd_or_zero(row: &SqliteRow, column: &str) -> MoneyVnd {
170:pub fn read_money_vnd_strict(row: &SqliteRow, column: &str) -> MoneyVnd {
181:pub fn validate_non_negative_booking_money(
```

### `mhm/src-tauri/src/services/booking/`
**tests.rs**
```rust
704:pub fn minimal_checkin_request(room_id: &str) -> CheckInRequest {
792:pub fn minimal_reservation_request(room_id: &str) -> CreateReservationRequest {
807:pub fn minimal_group_checkin_request(room_ids: &[&str]) -> GroupCheckinRequest {
845:pub fn rich_group_checkin_request(
887:fn group_checkin_hash_payload_for_test(req: &GroupCheckinRequest) -> serde_json::Value {
935:fn add_folio_line_hash_payload_for_test(
2377:fn group_checkout_locked_room_map_rejects_changed_room_mapping() {
3388:fn reservation_modify_request(
```

### `mhm/src-tauri/src/services/`
**mod.rs**
```rust
```

### `mhm/src-tauri/src/services/`
**settings_store.rs**
```rust
```

### `mhm/src-tauri/src/services/setup/`
**mod.rs**
```rust
```

### `mhm/src-tauri/src/services/setup/`
**provisioning.rs**
```rust
90:fn validate_onboarding_request(req: &OnboardingCompleteRequest) -> Result<(), String> {
167:fn is_hhmm(value: &str) -> bool {
223:fn room_type_id(name: &str) -> String {
```

### `mhm/src-tauri/src/services/setup/`
**status.rs**
```rust
```

### `mhm/src-tauri/src/services/setup/`
**tests.rs**
```rust
38:fn sample_onboarding_request(with_pin: bool) -> OnboardingCompleteRequest {
```

### `mhm/src-tauri/src/`
**support_log.rs**
```rust
13:pub struct SupportErrorRecord {
23:impl SupportErrorRecord {
43:fn append_mutex() -> &'static Mutex<()> {
48:pub fn support_log_path(runtime_root: &Path) -> PathBuf {
54:pub fn append_support_error_record(
```

### `mhm/src-tauri/src/`
**watcher.rs**
```rust
13:pub fn start_watcher(app_handle: AppHandle) -> Result<(), String> {
47:fn run_watcher(scans_dir: PathBuf, app_handle: AppHandle) -> Result<(), String> {
106:fn is_valid_image(path: &Path) -> bool {
```

### `mhm/src-tauri/src/`
**write_manifest.rs**
```rust
2:pub enum LockDeriverId {
13:impl LockDeriverId {
29:pub struct WriteCommandMeta {
98:pub fn meta_for(command_name: &str) -> Option<&'static WriteCommandMeta> {
```

