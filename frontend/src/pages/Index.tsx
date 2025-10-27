"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Define the 10 core virtues for the R.I.G.H.T. framework
const predefinedVirtues = [
  { id: "resilience", label: "Resilience" },
  { id: "integrity", label: "Integrity" },
  { id: "grit", label: "Grit" },
  { id: "humility", label: "Humility" },
  { id: "thoughtfulness", label: "Thoughtfulness" },
  { id: "courage", label: "Courage" },
  { id: "empathy", label: "Empathy" },
  { id: "wisdom", label: "Wisdom" },
  { id: "persistence", label: "Persistence" },
  { id: "creativity", label: "Creativity" },
] as const;

const FormSchema = z.object({
  priorityVirtues: z.array(z.string()).refine(
    (val) => val.length >= 2 && val.length <= 3,
    "You must select between 2 and 3 priority virtues.",
  ),
});

const PRIORITY_VIRTUES_KEY = "priorityVirtues";
const CALENDAR_CONNECTED_KEY = "calendarConnected";
const CUSTOM_VIRTUES_KEY = "customVirtues";

const Index = () => {
  const navigate = useNavigate();
  const [allVirtues, setAllVirtues] = React.useState(predefinedVirtues);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      priorityVirtues: [],
    },
  });

  // Redirect if onboarding is already complete
  React.useEffect(() => {
    const storedVirtues = localStorage.getItem(PRIORITY_VIRTUES_KEY);
    const calendarConnected = localStorage.getItem(CALENDAR_CONNECTED_KEY) === "true";

    if (storedVirtues && calendarConnected) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Load custom virtues and combine with predefined virtues
  React.useEffect(() => {
    const storedCustomVirtues = localStorage.getItem(CUSTOM_VIRTUES_KEY);
    if (storedCustomVirtues) {
      const parsedCustomVirtues = JSON.parse(storedCustomVirtues).map((v: string) => ({ id: v.toLowerCase().replace(/\s/g, '-'), label: v }));
      setAllVirtues([...predefinedVirtues, ...parsedCustomVirtues]);
    }
  }, []); // Run once on mount

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("Form submitted with data:", data);
    localStorage.setItem(PRIORITY_VIRTUES_KEY, JSON.stringify(data.priorityVirtues));
    toast.success("Priority virtues saved!", {
      description: `You've selected: ${data.priorityVirtues.map(v => allVirtues.find(virt => virt.id === v)?.label).join(", ")}`,
    });
    navigate("/calendar-integration");
  }

  // Log form errors for debugging
  React.useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.error("Form validation errors:", form.formState.errors);
    }
  }, [form.formState.errors]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Character Assessment</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Select 2-3 priority virtues you wish to develop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="priorityVirtues"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Available Virtues</FormLabel>
                      <FormDescription>
                        Choose the virtues most important for your innovation journey.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {allVirtues.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="priorityVirtues"
                          render={({ field: innerField }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={innerField.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...innerField.value, item.id]
                                        : innerField.value?.filter(
                                            (value) => value !== item.id,
                                          );
                                      innerField.onChange(newValue);
                                      console.log("Checkbox changed. Current priorityVirtues:", newValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Continue</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;