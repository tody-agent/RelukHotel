import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "../helpers/render-app";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { setMockResponses, clearMockResponses, invoke } from "@test-mocks/tauri-core";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHotelStore } from "@/stores/useHotelStore";
import { createAllRooms, createStats, createUser } from "../helpers/mock-data";

const mockUser = createUser({ id: "u1", name: "Admin" });
const mockRooms = createAllRooms();
const mockStats = createStats();

function setupAuthenticated() {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true, loading: false, error: null });
    useHotelStore.setState({
        rooms: mockRooms,
        stats: mockStats,
        activeTab: "dashboard",
        roomDetail: null,
        housekeepingTasks: [],
        loading: false,
        isCheckinOpen: false,
    });

    setMockResponses({
        get_rooms: () => mockRooms,
        get_dashboard_stats: () => mockStats,
        get_current_user: () => mockUser,
        get_settings: () => null,
        get_recent_activity: () => [],
        get_revenue_stats: () => ({ total_revenue: 0, rooms_sold: 0, occupancy_rate: 0, daily_revenue: [] }),
        get_expenses: () => [],
        get_all_bookings: () => [],
        // Mock the new calculate_price_v2
        calculate_price_v2: () => ({
            line_items: [{ description: "1 đêm × 350.000đ", amount: 350000 }],
            room_subtotal: 350000,
            currency: "VND"
        }),
        search_guest_by_phone: () => [],
        get_bootstrap_status: () => ({ setup_completed: true, app_lock_enabled: false, current_user: mockUser }),
        get_crash_reporting_preference: () => false,
        get_pending_crash_report: () => null,
        gateway_get_status: () => ({ running: false }),
    });
}

describe("15 — Pricing Engine Check-in", () => {
    beforeEach(() => {
        clearMockResponses();
        invoke.mockClear();
        setupAuthenticated();
    });

    it("1. Render cơ bản: mở sheet hiển thị Check-in / Nhận phòng", async () => {
        render(<App />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText("+ Khách mới")).toBeInTheDocument();
        });

        await user.click(screen.getByText("+ Khách mới"));

        await waitFor(() => {
            expect(screen.getByText("Check-in Khách Mới")).toBeInTheDocument();
            expect(useHotelStore.getState().isCheckinOpen).toBe(true);
        });
    });

    it("2. Chọn phòng: chọn phòng từ dropdown hiển thị", async () => {
        useHotelStore.setState({ isCheckinOpen: true });
        render(<App />);

        await waitFor(() => {
            expect(screen.getByText("Chọn phòng...")).toBeInTheDocument();
        });
        
        // Select room 1A
        const roomSelect = screen.getByLabelText(/Phòng/i);
        await userEvent.selectOptions(roomSelect, "1A");
        
        // Wait for selection to reflect
        await waitFor(() => {
            expect(roomSelect).toHaveValue("1A");
        });
    });

    it("3. Pricing preview: chọn phòng + 2 đêm gọi calculate_price_v2", async () => {
        useHotelStore.setState({ isCheckinOpen: true });
        render(<App />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText("Chọn phòng...")).toBeInTheDocument();
        });

        const roomSelect = screen.getByLabelText(/Phòng/i);
        await user.selectOptions(roomSelect, "1A");

        const nightsInput = screen.getByLabelText(/Số đêm/i);
        await user.clear(nightsInput);
        await user.type(nightsInput, "2");

        // The debounce takes 300ms, wait for invoke to be called
        await waitFor(() => {
            const calls = invoke.mock.calls.filter(([cmd]) => cmd === "calculate_price_v2");
            expect(calls.length).toBeGreaterThan(0);
            
            // Check the last call arguments
            const lastCall = calls[calls.length - 1];
            expect(lastCall[1]).toMatchObject({
                roomTypeId: expect.any(String),
                occupants: 1
            });
        });
        
        // Wait for preview to appear (350,000 VND formatted is 350.000 or 350,000)
        await waitFor(() => {
            const elements = screen.getAllByText(/350[.,]000/);
            expect(elements.length).toBeGreaterThan(0);
        });
    });

    it("4. Quick mode: toggle Quick mode ẩn field CCCD", async () => {
        useHotelStore.setState({ isCheckinOpen: true });
        render(<App />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText("Chọn phòng...")).toBeInTheDocument();
        });

        // Ensure "Nhanh" toggle exists
        const fullModeToggle = screen.getByRole("button", { name: /Đầy đủ/i });
        
        // By default Quick Mode is ON, CCCD shouldn't be required/visible
        expect(screen.queryByLabelText(/Số CCCD/i)).not.toBeInTheDocument();

        // Turn off Quick mode
        await user.click(fullModeToggle);

        // CCCD field should appear
        await waitFor(() => {
            expect(screen.getByLabelText(/Số CCCD/i)).toBeInTheDocument();
        });
    });

    it("5. Validation: thiếu tên thì button disabled", async () => {
        useHotelStore.setState({ isCheckinOpen: true });
        render(<App />);
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText("Chọn phòng...")).toBeInTheDocument();
        });

        const roomSelect = screen.getByLabelText(/Phòng/i);
        await user.selectOptions(roomSelect, "1A");

        // Name is empty by default
        const submitBtn = screen.getByRole("button", { name: /Check-in/i });
        
        // Wait for the button to be disabled
        await waitFor(() => {
            expect(submitBtn).toBeDisabled();
        });

        // Type a name
        const nameInput = screen.getByLabelText(/Họ và tên/i);
        await user.type(nameInput, "Nguyen Van A");

        // Type a phone number
        const phoneInput = screen.getByLabelText(/Số điện thoại/i);
        await user.type(phoneInput, "0987654321");

        // Now it should be enabled
        await waitFor(() => {
            expect(submitBtn).not.toBeDisabled();
        });
    });
});
