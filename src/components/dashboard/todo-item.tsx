"use client";

import type { Todo, EisenhowerQuadrant } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onStartFocus: (todo: Todo) => void;
}

const quadrantConfig: Record<
  EisenhowerQuadrant,
  { label: string; color: string; }
> = {
  Q1: { label: "Urgent & Important", color: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30" },
  Q2: { label: "Not Urgent & Important", color: "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30" },
  Q3: { label: "Urgent & Not Important", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30" },
  Q4: { label: "Not Urgent & Not Important", color: "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30" },
};

export function TodoItem({ todo, onToggleComplete, onDelete, onEdit, onStartFocus }: TodoItemProps) {

  return (
    <Card className={cn("transition-all", todo.completed && "bg-secondary/50")}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-4">
        <div className="flex items-start gap-4">
          <Checkbox
            id={`todo-${todo.id}`}
            checked={todo.completed}
            onCheckedChange={(checked) => onToggleComplete(todo.id, !!checked)}
            className="mt-1"
          />
          <div className="grid gap-1">
            <CardTitle className={cn("text-lg", todo.completed && "line-through text-muted-foreground")}>
              {todo.title}
            </CardTitle>
            {todo.description && (
              <CardDescription className={cn(todo.completed && "line-through text-muted-foreground/80")}>
                {todo.description}
              </CardDescription>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(todo)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(todo.id)} className="text-red-400 focus:text-red-400">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4 pt-0">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("font-normal", quadrantConfig[todo.quadrant].color)}>
            {quadrantConfig[todo.quadrant].label}
          </Badge>
          {todo.tag && <Badge variant="secondary">{todo.tag}</Badge>}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {todo.pomodoroTime > 0 && <span>{todo.pomodoroTime} min focused</span>}
          <span>Due {formatDistanceToNow(todo.dueDate, { addSuffix: true })}</span>
           { !todo.completed && (
             <Button variant="ghost" size="sm" onClick={() => onStartFocus(todo)}>
                <Play className="mr-2 h-4 w-4" /> Start Focus
             </Button>
           )}
        </div>
      </CardContent>
    </Card>
  );
}
