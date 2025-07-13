"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TodoItem } from "./todo-item";
import { AddEditTodoDialog } from "./add-edit-todo-dialog";
import type { Todo, EisenhowerQuadrant } from "@/lib/types";
import { PlusCircle, LogOut } from "lucide-react";
import { isToday, isThisWeek } from "date-fns";

interface DashboardProps {
  initialTodos: Todo[];
}

const priorityOrder: Record<EisenhowerQuadrant, number> = {
  Q2: 1,
  Q1: 2,
  Q3: 3,
  Q4: 4,
};

export function Dashboard({ initialTodos }: DashboardProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos.map(t => ({...t, dueDate: new Date(t.dueDate)})));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null);
  const [activeTab, setActiveTab] = useState("today");
  const router = useRouter();

  const handleLogout = () => {
    // This is a mock implementation. In a real app, you'd clear the session.
    router.push("/login");
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, completed } : todo))
    );
  };

  const handleDelete = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleEdit = (todo: Todo) => {
    setTodoToEdit(todo);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setTodoToEdit(null);
    setIsDialogOpen(true);
  };

  const handleSaveTodo = (
    data: Omit<Todo, "id" | "completed" | "pomodoroTime">,
    id?: string
  ) => {
    if (id) {
      // Edit
      setTodos(
        todos.map((todo) => (todo.id === id ? { ...todo, ...data } : todo))
      );
    } else {
      // Add
      const newTodo: Todo = {
        id: new Date().toISOString(),
        ...data,
        completed: false,
        pomodoroTime: 0,
      };
      setTodos([...todos, newTodo]);
    }
  };

  const handleAddPomodoroTime = (id: string, minutes: number) => {
    setTodos(
        todos.map((todo) => (todo.id === id ? { ...todo, pomodoroTime: todo.pomodoroTime + minutes } : todo))
    )
  }

  const sortedTodos = useMemo(() => {
    const filtered = todos.filter((todo) => {
      if (activeTab === 'today') return isToday(todo.dueDate);
      if (activeTab === 'this-week') return isThisWeek(todo.dueDate, { weekStartsOn: 1 });
      return false;
    });

    return filtered.sort((a, b) => {
        if(a.completed !== b.completed) return a.completed ? 1 : -1;
        return priorityOrder[a.quadrant] - priorityOrder[b.quadrant]
    });
  }, [todos, activeTab]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Eisenhower Matrix</h1>
          <p className="text-muted-foreground">Prioritize your tasks and focus on what matters.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="this-week">This Week</TabsTrigger>
        </TabsList>
        <TabsContent value="today">
          <TodoList todos={sortedTodos} onToggleComplete={handleToggleComplete} onDelete={handleDelete} onEdit={handleEdit} onAddPomodoroTime={handleAddPomodoroTime} />
        </TabsContent>
        <TabsContent value="this-week">
          <TodoList todos={sortedTodos} onToggleComplete={handleToggleComplete} onDelete={handleDelete} onEdit={handleEdit} onAddPomodoroTime={handleAddPomodoroTime}/>
        </TabsContent>
      </Tabs>

      <AddEditTodoDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        onSave={handleSaveTodo}
        todoToEdit={todoToEdit}
      />
    </div>
  );
}

function TodoList({ todos, ...props }: { todos: Todo[] } & Omit<React.ComponentProps<typeof TodoItem>, 'todo'>) {
    if (todos.length === 0) {
        return (
            <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center">
                <h3 className="text-lg font-semibold text-muted-foreground">No tasks here!</h3>
                <p className="text-sm text-muted-foreground">Add a new task to get started.</p>
            </div>
        );
    }
    return (
        <div className="mt-4 space-y-4">
            {todos.map(todo => (
                <TodoItem key={todo.id} todo={todo} {...props} />
            ))}
        </div>
    )
}
