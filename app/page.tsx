"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Todo = {
  id: number;
  text: string;
  done: boolean;
};

type Filter = "all" | "active" | "completed";

const initialTodos: Todo[] = [
  { id: 1, text: "Finish the Next.js todo site", done: true },
  { id: 2, text: "Add a new task", done: false },
  { id: 3, text: "Mark tasks as complete", done: false },
];

const filters: Filter[] = ["all", "active", "completed"];
const STORAGE_KEY = "nextjs-todo-items";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
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
      },
      ...current,
    ]);
    setInput("");
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b,_#0f172a_55%,_#020617)] px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <section className="rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/30 backdrop-blur-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.3em] text-cyan-300/80">
                Next.js Todo
              </p>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Keep your day under control.
              </h1>
              <p className="mt-3 max-w-xl text-base text-slate-300 md:text-lg">
                A clean todo page built with Next.js, Bun, and a little bit of
                restraint.
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
          <form className="flex flex-col gap-3 md:flex-row" onSubmit={addTodo}>
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

          <div className="flex flex-col gap-4">
            {visibleTodos.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-8 text-center text-slate-400">
                No tasks in this view.
              </div>
            ) : (
              visibleTodos.map((todo) => (
                <article
                  key={todo.id}
                  className="flex items-center gap-4 rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-lg shadow-black/20 backdrop-blur-md"
                >
                  <button
                    type="button"
                    aria-label={`Toggle ${todo.text}`}
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                      todo.done
                        ? "border-emerald-300 bg-emerald-300 text-slate-950"
                        : "border-slate-500 bg-transparent text-transparent"
                    }`}
                  >
                    ✓
                  </button>

                  <div className="flex-1">
                    <p
                      className={`text-lg transition ${
                        todo.done
                          ? "text-slate-400 line-through"
                          : "text-white"
                      }`}
                    >
                      {todo.text}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTodo(todo.id)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
