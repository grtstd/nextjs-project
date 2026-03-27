"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Priority = "low" | "medium" | "high";
type Filter = "all" | "active" | "completed";

type Todo = {
  id: number;
  text: string;
  done: boolean;
  dueDate: string;
  priority: Priority;
};

const initialTodos: Todo[] = [
  {
    id: 1,
    text: "Finish the Next.js todo site",
    done: true,
    dueDate: "",
    priority: "high",
  },
  {
    id: 2,
    text: "Add a new task",
    done: false,
    dueDate: "",
    priority: "medium",
  },
  {
    id: 3,
    text: "Mark tasks as complete",
    done: false,
    dueDate: "",
    priority: "low",
  },
];

const filters: Filter[] = ["all", "active", "completed"];
const priorities: Priority[] = ["low", "medium", "high"];
const STORAGE_KEY = "nextjs-todo-items";

const priorityStyles: Record<Priority, string> = {
  low: "bg-sky-400/15 text-sky-200 border-sky-400/30",
  medium: "bg-amber-400/15 text-amber-200 border-amber-400/30",
  high: "bg-rose-400/15 text-rose-200 border-rose-400/30",
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dropTargetId, setDropTargetId] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Todo[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTodos(parsed);
        }
      }
    } catch {
      // ignore localStorage/JSON errors
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, isReady]);

  const stats = useMemo(() => {
    const done = todos.filter((todo) => todo.done).length;
    return {
      total: todos.length,
      done,
      left: todos.length - done,
    };
  }, [todos]);

  const visibleTodos = useMemo(() => {
    if (filter === "active") return todos.filter((todo) => !todo.done);
    if (filter === "completed") return todos.filter((todo) => todo.done);
    return todos;
  }, [todos, filter]);

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();
    if (!text) return;

    setTodos((current) => [
      {
        id: Date.now(),
        text,
        done: false,
        dueDate,
        priority,
      },
      ...current,
    ]);

    setInput("");
    setDueDate("");
    setPriority("medium");
  }

  function toggleTodo(id: number) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  }

  function removeTodo(id: number) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  function clearCompleted() {
    setTodos((current) => current.filter((todo) => !todo.done));
  }

  function startEditing(todo: Todo) {
    setEditingId(todo.id);
    setEditingText(todo.text);
  }

  function saveEditing(id: number) {
    const text = editingText.trim();
    if (!text) return;

    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, text } : todo)),
    );
    setEditingId(null);
    setEditingText("");
  }

  function updateDueDate(id: number, nextDueDate: string) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, dueDate: nextDueDate } : todo,
      ),
    );
  }

  function updatePriority(id: number, nextPriority: Priority) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, priority: nextPriority } : todo,
      ),
    );
  }

  function handleDrop(targetId: number) {
    if (draggedId === null || draggedId === targetId) return;

    setTodos((current) => {
      const next = [...current];
      const fromIndex = next.findIndex((todo) => todo.id === draggedId);
      const toIndex = next.findIndex((todo) => todo.id === targetId);

      if (fromIndex === -1 || toIndex === -1) return current;

      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

    setDraggedId(null);
    setDropTargetId(null);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b,_#0f172a_55%,_#020617)] px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <section className="rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/30 backdrop-blur-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.3em] text-cyan-300/80">
                Next.js Todo
              </p>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Keep your day under control.
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-300 md:text-lg">
                Tasks now support editing, deadlines, priority labels, and
                drag-and-drop reordering.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-2xl bg-black/20 px-4 py-3">
                <div className="text-2xl font-semibold">{stats.total}</div>
                <div className="text-slate-300">total</div>
              </div>
              <div className="rounded-2xl bg-black/20 px-4 py-3">
                <div className="text-2xl font-semibold text-emerald-300">
                  {stats.done}
                </div>
                <div className="text-slate-300">done</div>
              </div>
              <div className="rounded-2xl bg-black/20 px-4 py-3">
                <div className="text-2xl font-semibold text-amber-300">
                  {stats.left}
                </div>
                <div className="text-slate-300">left</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-black/20 backdrop-blur-md">
          <form className="flex flex-col gap-3" onSubmit={addTodo}>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Add a task..."
                className="h-14 flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 text-base outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400"
              />
              <button
                type="submit"
                className="h-14 rounded-2xl bg-cyan-400 px-6 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Add todo
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Deadline
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-base outline-none focus:border-cyan-400"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Priority
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as Priority)}
                  className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-base outline-none focus:border-cyan-400"
                >
                  {priorities.map((item) => (
                    <option key={item} value={item} className="bg-slate-900">
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </form>
          <p className="mt-3 text-sm text-slate-400">
            Your tasks are saved in the browser automatically.
          </p>
        </section>

        <section className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-slate-950/50 p-5 shadow-xl shadow-black/20 backdrop-blur-md">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map((item) => {
                const active = filter === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
                      active
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={clearCompleted}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-red-400 hover:text-red-300"
            >
              Clear completed
            </button>
          </div>

          {filter === "all" && (
            <div className="rounded-2xl border border-dashed border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-100">
              Drag tasks by the dotted handle <span className="font-semibold">⋮⋮</span>{" "}
              to reorder them.
            </div>
          )}

          <div className="flex flex-col gap-4">
            {visibleTodos.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-8 text-center text-slate-400">
                No tasks in this view.
              </div>
            ) : (
              visibleTodos.map((todo) => {
                const isDragged = draggedId === todo.id;
                const isDropTarget = dropTargetId === todo.id && draggedId !== todo.id;

                return (
                  <article
                    key={todo.id}
                    draggable={filter === "all"}
                    onDragStart={() => setDraggedId(todo.id)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (filter === "all") setDropTargetId(todo.id);
                    }}
                    onDragLeave={() => {
                      if (dropTargetId === todo.id) setDropTargetId(null);
                    }}
                    onDrop={() => handleDrop(todo.id)}
                    onDragEnd={() => {
                      setDraggedId(null);
                      setDropTargetId(null);
                    }}
                    className={`flex flex-col gap-4 rounded-[28px] border p-5 shadow-lg shadow-black/20 backdrop-blur-md transition ${
                      isDragged
                        ? "border-cyan-300/60 bg-cyan-300/10 opacity-60 scale-[0.99]"
                        : isDropTarget
                          ? "border-cyan-300 bg-cyan-300/10 ring-2 ring-cyan-300/40"
                          : "border-white/10 bg-white/10 opacity-100"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 rounded-xl border border-dashed px-2 py-1 text-sm tracking-widest ${
                          filter === "all"
                            ? "cursor-grab border-cyan-400/40 bg-cyan-400/10 text-cyan-200 active:cursor-grabbing"
                            : "border-white/10 text-slate-500"
                        }`}
                        title="Drag to reorder"
                      >
                        ⋮⋮
                      </div>

                      <button
                        type="button"
                        aria-label={`Toggle ${todo.text}`}
                        onClick={() => toggleTodo(todo.id)}
                        className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                          todo.done
                            ? "border-emerald-300 bg-emerald-300 text-slate-950"
                            : "border-slate-500 bg-transparent text-transparent"
                        }`}
                      >
                        ✓
                      </button>

                      <div className="flex-1">
                        {editingId === todo.id ? (
                          <div className="flex flex-col gap-3">
                            <input
                              value={editingText}
                              onChange={(event) => setEditingText(event.target.value)}
                              className="h-12 rounded-2xl border border-cyan-400 bg-white/5 px-4 text-base outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => saveEditing(todo.id)}
                                className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditingText("");
                                }}
                                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p
                              className={`text-lg transition ${
                                todo.done
                                  ? "text-slate-400 line-through"
                                  : "text-white"
                              }`}
                            >
                              {todo.text}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                              <span
                                className={`rounded-full border px-3 py-1 capitalize ${priorityStyles[todo.priority]}`}
                              >
                                {todo.priority}
                              </span>
                              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-slate-300">
                                {todo.dueDate ? `Due: ${todo.dueDate}` : "No deadline"}
                              </span>
                              {filter === "all" && (
                                <span className="rounded-full border border-dashed border-white/10 px-3 py-1 text-slate-400">
                                  Drag to reorder
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => startEditing(todo)}
                          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTodo(todo.id)}
                          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="flex flex-col gap-2 text-sm text-slate-300">
                        Deadline
                        <input
                          type="date"
                          value={todo.dueDate}
                          onChange={(event) =>
                            updateDueDate(todo.id, event.target.value)
                          }
                          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-base outline-none focus:border-cyan-400"
                        />
                      </label>

                      <label className="flex flex-col gap-2 text-sm text-slate-300">
                        Priority
                        <select
                          value={todo.priority}
                          onChange={(event) =>
                            updatePriority(todo.id, event.target.value as Priority)
                          }
                          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-base outline-none focus:border-cyan-400"
                        >
                          {priorities.map((item) => (
                            <option key={item} value={item} className="bg-slate-900">
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
