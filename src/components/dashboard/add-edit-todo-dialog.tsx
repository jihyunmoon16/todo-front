"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { Todo, EisenhowerQuadrant } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.date({ required_error: "Due date is required" }),
  tag: z.string().optional(),
  quadrant: z.enum(["Q1", "Q2", "Q3", "Q4"], { required_error: "You need to select a quadrant." }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEditTodoDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (todo: Omit<Todo, "id" | "completed" | "pomodoroTime">, id?: string) => void;
  todoToEdit?: Todo | null;
}

const quadrantDescriptions = {
  Q1: "Urgent & Important: Crises, pressing problems, deadline-driven projects.",
  Q2: "Not Urgent & Important: Prevention, planning, relationship building, new opportunities.",
  Q3: "Urgent & Not Important: Interruptions, some calls, some mail, popular activities.",
  Q4: "Not Urgent & Not Important: Trivia, some mail, some calls, time wasters."
}

export function AddEditTodoDialog({ isOpen, setIsOpen, onSave, todoToEdit }: AddEditTodoDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: new Date(),
      tag: "",
      quadrant: "Q2",
    },
  });

  useEffect(() => {
    if (todoToEdit && isOpen) {
      form.reset({
        title: todoToEdit.title,
        description: todoToEdit.description || "",
        dueDate: todoToEdit.dueDate,
        tag: todoToEdit.tag || "",
        quadrant: todoToEdit.quadrant,
      });
    } else if (!isOpen) {
      form.reset();
    }
  }, [isOpen, todoToEdit, form]);

  const onSubmit = (values: FormValues) => {
    onSave(values, todoToEdit?.id);
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{todoToEdit ? "Edit Task" : "Add a new task"}</DialogTitle>
          <DialogDescription>
            {todoToEdit ? "Update the details of your task." : "Fill in the details for your new task."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Finish project proposal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add more details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Work" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="quadrant"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Eisenhower Quadrant</FormLabel>
                   <FormDescription>
                    {quadrantDescriptions[field.value as EisenhowerQuadrant]}
                  </FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      {Object.keys(quadrantDescriptions).map((key) => (
                        <FormItem key={key} className="flex-1">
                          <FormControl>
                            <RadioGroupItem value={key} className="sr-only" />
                          </FormControl>
                          <FormLabel
                            className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                            field.value === key && "border-primary"
                            )}
                          >
                             {key}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Save Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
