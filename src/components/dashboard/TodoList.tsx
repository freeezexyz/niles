"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Sparkles } from "lucide-react";
import type { Todo } from "@/lib/types";

const priorityColors: Record<string, string> = {
  high: "border-destructive/40 text-destructive",
  medium: "border-gold-500/40 text-gold-500",
  low: "border-border text-[var(--text-muted)]",
  grow: "border-principle-trust/40 text-principle-trust",
};

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [adding, setAdding] = useState(false);

  async function loadTodos() {
    const supabase = createClient();
    const { data } = await supabase
      .from("todos")
      .select("*")
      .eq("is_completed", false)
      .order("created_at", { ascending: false })
      .limit(20);
    setTodos(data || []);
  }

  useEffect(() => {
    loadTodos();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setAdding(true);

    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: newTodo.trim(),
        priority: "medium",
        due_date: new Date().toISOString().split("T")[0],
      }),
    });

    if (res.ok) {
      setNewTodo("");
      await loadTodos();
    }
    setAdding(false);
  }

  async function handleToggle(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));

    await fetch("/api/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_completed: true }),
    });
  }

  return (
    <div className="space-y-3">
      {/* Add todo */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a task..."
          className="bg-[var(--input)] text-sm"
          disabled={adding}
        />
        <Button
          type="submit"
          size="icon"
          disabled={adding || !newTodo.trim()}
          className="shrink-0 bg-gold-500 text-background hover:bg-gold-600 h-9 w-9"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {/* Todo items */}
      {todos.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-4">
          No tasks yet. Add one above or let Niles suggest some.
        </p>
      ) : (
        <div className="space-y-1.5">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-start gap-2 rounded-lg border border-border bg-card p-2.5 group"
            >
              <button
                onClick={() => handleToggle(todo.id)}
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border text-transparent hover:border-gold-500 hover:text-gold-500 transition-colors"
              >
                <Check className="h-3 w-3" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{todo.content}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {todo.is_ai_generated && (
                  <Sparkles className="h-3 w-3 text-gold-500" />
                )}
                <Badge
                  variant="outline"
                  className={`text-[9px] px-1.5 py-0 ${priorityColors[todo.priority] || ""}`}
                >
                  {todo.priority.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
