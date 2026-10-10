import {
    beforeEach,
    describe,
    expect,
    test,
    vi,
} from "vitest";

import {
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";

import NoteActivityTimeline from "./NoteActivityTimeline";
import { noteService } from "./noteService";

vi.mock("./noteService", () => ({
    noteService: {
        getNoteActivity: vi.fn(),
    },
}));

const { mockLogout } = vi.hoisted(() => ({
    mockLogout: vi.fn(),
}));

vi.mock("../auth/AuthContext", () => ({
    useAuth: () => ({
        logout: mockLogout,
    }),
}));

describe("NoteActivityTimeline", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        noteService.getNoteActivity.mockResolvedValue({
            success: true,
            data: {
                activities: [],
                pagination: {
                    totalLogs: 0,
                    currentPage: 1,
                    totalPages: 0,
                    limit: 20,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            },
        });
    });

    test("shows loading state while activity is loading", async () => {
        let resolveRequest;

        noteService.getNoteActivity.mockReturnValue(
            new Promise((resolve) => {
                resolveRequest = resolve;
            })
        );

        render(
            <NoteActivityTimeline noteId="note1" />
        );

        expect(
            screen.getByRole("status")
        ).toHaveTextContent("Loading activity...");

        resolveRequest({
            success: true,
            data: {
                activities: [],
                pagination: {
                    totalLogs: 0,
                    currentPage: 1,
                    totalPages: 0,
                    limit: 20,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            },
        });

        expect(
            await screen.findByText(
                "No activity recorded yet."
            )
        ).toBeInTheDocument();
    });

    test("loads and displays activity entries", async () => {
        noteService.getNoteActivity.mockResolvedValue({
            success: true,
            data: {
                activities: [
                    {
                        id: "activity1",
                        action: "NOTE_CREATED",
                        description: "Note created",
                        createdAt:
                            "2026-10-10T10:00:00.000Z",
                    },
                    {
                        id: "activity2",
                        action: "NOTE_UPDATED",
                        description: "Note updated",
                        createdAt:
                            "2026-10-10T11:00:00.000Z",
                    },
                ],
                pagination: {
                    totalLogs: 2,
                    currentPage: 1,
                    totalPages: 1,
                    limit: 20,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            },
        });

        render(
            <NoteActivityTimeline noteId="note1" />
        );

        expect(
            await screen.findByText("Note created")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Note updated")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("list", {
                name: "Note activity history",
            }).querySelectorAll("li")
        ).toHaveLength(2);

        expect(
            noteService.getNoteActivity
        ).toHaveBeenCalledWith("note1", {
            page: 1,
            limit: 20,
        });
    });

    test("shows an empty state when no activity exists", async () => {
        render(
            <NoteActivityTimeline noteId="note1" />
        );

        expect(
            await screen.findByText(
                "No activity recorded yet."
            )
        ).toBeInTheDocument();
    });

    test("loads the next page and preserves previous activity", async () => {
        noteService.getNoteActivity
            .mockResolvedValueOnce({
                success: true,
                data: {
                    activities: [
                        {
                            id: "activity1",
                            action: "NOTE_CREATED",
                            description: "Note created",
                            createdAt:
                                "2026-10-10T10:00:00.000Z",
                        },
                    ],
                    pagination: {
                        totalLogs: 21,
                        currentPage: 1,
                        totalPages: 2,
                        limit: 20,
                        hasNextPage: true,
                        hasPrevPage: false,
                    },
                },
            })
            .mockResolvedValueOnce({
                success: true,
                data: {
                    activities: [
                        {
                            id: "activity2",
                            action: "NOTE_UPDATED",
                            description: "Note updated",
                            createdAt:
                                "2026-10-10T11:00:00.000Z",
                        },
                    ],
                    pagination: {
                        totalLogs: 21,
                        currentPage: 2,
                        totalPages: 2,
                        limit: 20,
                        hasNextPage: false,
                        hasPrevPage: true,
                    },
                },
            });

        render(
            <NoteActivityTimeline noteId="note1" />
        );

        expect(
            await screen.findByText("Note created")
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Load more",
            })
        );

        expect(
            await screen.findByText("Note updated")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Note created")
        ).toBeInTheDocument();

        expect(
            noteService.getNoteActivity
        ).toHaveBeenNthCalledWith(2, "note1", {
            page: 2,
            limit: 20,
        });

        expect(
            screen.queryByRole("button", {
                name: "Load more",
            })
        ).not.toBeInTheDocument();
    });

    test("shows an error and retries when activity loading fails", async () => {
        noteService.getNoteActivity
            .mockRejectedValueOnce({
                response: {
                    data: {
                        message:
                            "Failed to load note activity",
                    },
                },
            })
            .mockResolvedValueOnce({
                success: true,
                data: {
                    activities: [],
                    pagination: {
                        totalLogs: 0,
                        currentPage: 1,
                        totalPages: 0,
                        limit: 20,
                        hasNextPage: false,
                        hasPrevPage: false,
                    },
                },
            });

        render(
            <NoteActivityTimeline noteId="note1" />
        );

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "Failed to load note activity"
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Retry",
            })
        );

        await waitFor(() => {
            expect(
                noteService.getNoteActivity
            ).toHaveBeenCalledTimes(2);
        });

        expect(
            await screen.findByText(
                "No activity recorded yet."
            )
        ).toBeInTheDocument();
    });

    test("does not load more when another page is unavailable", async () => {
        render(
            <NoteActivityTimeline noteId="note1" />
        );

        await screen.findByText(
            "No activity recorded yet."
        );

        expect(
            screen.queryByRole("button", {
                name: "Load more",
            })
        ).not.toBeInTheDocument();

        expect(
            noteService.getNoteActivity
        ).toHaveBeenCalledTimes(1);
    });
});