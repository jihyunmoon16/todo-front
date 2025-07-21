"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TodoItem } from "./todo-item";
import { AddEditTodoDialog } from "./add-edit-todo-dialog";
import type { Todo, EisenhowerQuadrant, User } from "@/lib/types";
import { PlusCircle, LogOut } from "lucide-react";
import { format } from "date-fns";
import { FocusView } from "./focus-view";
import axios from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  initialTodos: Todo[];
}

const priorityOrder: Record<EisenhowerQuadrant, number> = {
  Q2: 1,
  Q1: 2,
  Q3: 3,
  Q4: 4,
};

const POMODORO_DURATION_KEY = "pomodoroDuration";
const DEFAULT_POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

export function Dashboard({ initialTodos }: DashboardProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos.map(t => ({...t, dueDate: new Date(t.dueDate)})));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null);

  const [focusedTodo, setFocusedTodo] = useState<Todo | null>(null);
  const [pomodoroDuration, setPomodoroDuration] = useState(DEFAULT_POMODORO_DURATION);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const router = useRouter();
  const { toast } = useToast();
  
  // 현재 날짜/시간 업데이트 (1초마다)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 사용자 정보 불러오기
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  // 로그인하지 않은 경우 /login으로 리다이렉트
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.replace("/login");
    }
  }, [router]);

  // 할 일 목록 불러오기
  const fetchTodos = async (date?: string) => {
    try {
      setLoading(true);
      const params = date ? { date } : {};
      const response = await axios.get('/api/todos', { params });
      
      // API 응답 데이터를 Todo 타입에 맞게 변환
      const apiTodos: Todo[] = response.data.map((todo: any) => ({
        ...todo,
        dueDate: new Date(todo.dueDate),
        quadrant: todo.priority, // API의 priority를 frontend의 quadrant로 매핑
        pomodoroTime: todo.pomodoroMinutes || 0, // API의 pomodoroMinutes를 frontend의 pomodoroTime으로 매핑
        completed: todo.completed || false,
      }));
      
      setTodos(apiTodos);
    } catch (error: any) {
      console.error('Failed to fetch todos:', error);
      toast({
        title: "Error",
        description: "Failed to load todos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 할 일 목록 불러오기
  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    try {
        const savedDuration = localStorage.getItem(POMODORO_DURATION_KEY);
        if (savedDuration) {
            setPomodoroDuration(JSON.parse(savedDuration));
        }
    } catch (error) {
        console.error("Could not read pomodoro duration from localStorage", error);
        setPomodoroDuration(DEFAULT_POMODORO_DURATION);
    }
  }, []);

  const handlePomodoroDurationChange = (newDuration: number) => {
    setPomodoroDuration(newDuration);
    try {
        localStorage.setItem(POMODORO_DURATION_KEY, JSON.stringify(newDuration));
    } catch (error) {
        console.error("Could not save pomodoro duration to localStorage", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const handleToggleComplete = async (id: string | number, completed: boolean) => {
    try {
      // 백엔드 API 호출
      if (completed) {
        await axios.patch(`/api/todos/${id}/complete`);
      } else {
        await axios.patch(`/api/todos/${id}/complete`, { completed: false });
      }
      
      // 프론트엔드 상태 업데이트
      setTodos(
        todos.map((todo) => (todo.id === id ? { ...todo, completed } : todo))
      );
      
      toast({
        title: "Success",
        description: `Task ${completed ? 'completed' : 'uncompleted'} successfully.`,
      });
    } catch (error) {
      console.error('Failed to update todo completion status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      // 백엔드 API 호출
      await axios.delete(`/api/todos/${id}`);
      
      // 프론트엔드 상태 업데이트
      setTodos(todos.filter((todo) => todo.id !== id));
      
      toast({
        title: "Success",
        description: "Task deleted successfully.",
      });
    } catch (error) {
      console.error('Failed to delete todo:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (todo: Todo) => {
    setTodoToEdit(todo);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setTodoToEdit(null);
    setIsDialogOpen(true);
  };

  const handleSaveTodo = async (
    data: Omit<Todo, "id" | "completed" | "pomodoroTime">,
    id?: string
  ) => {
    try {
      if (id) {
        // 수정 (PUT 요청)
        const apiData = {
          ...data,
          priority: data.quadrant, // quadrant를 priority로 매핑
          dueDate: data.dueDate instanceof Date ? data.dueDate.toISOString() : data.dueDate,
        };
        // quadrant 필드 제거 (백엔드에서 사용하지 않음)
        delete (apiData as any).quadrant;
        
        await axios.put(`/api/todos/${id}`, apiData);
        
        // 프론트엔드 상태 업데이트
        setTodos(
          todos.map((todo) => (todo.id === id ? { ...todo, ...data } : todo))
        );
        
        toast({
          title: "Success",
          description: "Task updated successfully.",
        });
      } else {
        // 새로 생성 (POST 요청)
        const apiData = {
          ...data,
          priority: data.quadrant, // quadrant를 priority로 매핑
          dueDate: data.dueDate instanceof Date ? data.dueDate.toISOString() : data.dueDate,
        };
        // quadrant 필드 제거 (백엔드에서 사용하지 않음)
        delete (apiData as any).quadrant;
        
        await axios.post('/api/todos', apiData);
        await fetchTodos(); // 목록 갱신
        
        toast({
          title: "Success",
          description: "Task created successfully.",
        });
      }
    } catch (error) {
      console.error('Failed to save todo:', error);
      toast({
        title: "Error",
        description: `Failed to ${id ? 'update' : 'create'} task. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleAddPomodoroTime = async (id: string | number, minutes: number) => {
    try {
      // 백엔드 API 호출
      await axios.patch(`/api/todos/${id}/pomodoro?minutes=${minutes}`);
      
      // 프론트엔드 상태 업데이트
      setTodos(
        todos.map((todo) => (todo.id === id ? { ...todo, pomodoroTime: (todo.pomodoroTime || 0) + minutes } : todo))
      );
      
      toast({
        title: "Success",
        description: `${minutes} minutes added to pomodoro time.`,
      });
    } catch (error) {
      console.error('Failed to add pomodoro time:', error);
      toast({
        title: "Error",
        description: "Failed to add pomodoro time. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleStartFocus = (todo: Todo) => {
    setFocusedTodo(todo);
  };

  const handleExitFocus = async (timeElapsed?: number) => {
    if (focusedTodo && timeElapsed) {
      await handleAddPomodoroTime(focusedTodo.id, timeElapsed);
    }
    setFocusedTodo(null);
  };

  const sortedTodos = useMemo(() => {
    return todos.sort((a, b) => {
        if(a.completed !== b.completed) return a.completed ? 1 : -1;
        const aQuadrant = a.quadrant || 'Q4';
        const bQuadrant = b.quadrant || 'Q4';
        return priorityOrder[aQuadrant] - priorityOrder[bQuadrant]
    });
  }, [todos]);

  if (focusedTodo) {
    return (
      <FocusView
        todo={focusedTodo}
        onExitFocus={handleExitFocus}
        initialDuration={pomodoroDuration}
        onDurationChange={handlePomodoroDurationChange}
      />
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">{user?.name || 'User'}'s Todo</h1>
          <p className="text-muted-foreground">
            Prioritize your tasks and focus on what matters.
          </p>
          <div className="mt-2 text-sm text-muted-foreground">
            {format(currentDateTime, 'EEEE, MMMM d, yyyy')} • {format(currentDateTime, 'HH:mm:ss')}
          </div>
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

      {loading ? (
        <div className="mt-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading todos...</p>
        </div>
      ) : (
        <TodoList todos={sortedTodos} onToggleComplete={handleToggleComplete} onDelete={handleDelete} onEdit={handleEdit} onStartFocus={handleStartFocus} />
      )}

      <AddEditTodoDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        onSave={handleSaveTodo}
        todoToEdit={todoToEdit}
      />
    </div>
  );
}

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (id: string | number, completed: boolean) => void;
  onDelete: (id: string | number) => void;
  onEdit: (todo: Todo) => void;
  onStartFocus: (todo: Todo) => void;
}

function TodoList({ todos, ...props }: TodoListProps) {
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
