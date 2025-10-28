"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Form validation schema
const formSchema = z
  .object({
    title: z.enum(
      ["Professor", "A/Professor", "Dr", "Mr", "Ms", "Miss", "Other"],
      {
        message: "Please select a title.",
      }
    ),
    otherTitle: z.string().optional(),
    firstName: z.string().min(1, "This field is required."),
    middleName: z.string().optional(),
    lastName: z.string().min(1, "This field is required."),
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    dateOfBirth: z.date({
      required_error: "Date of birth is required.",
    }),
    nationality: z.string().min(1, "This field is required."),
    institute: z.string().min(1, "This field is required."),
    paperTitle: z.string().optional(), // 先设为可选，后面用refine实现条件必填
    academicProfile: z.string().min(1, "This field is required."),
    conferenceInterests: z.string().min(1, "This field is required."),
    iacrExperience: z.string().min(1, "This field is required."),
    author: z.enum(["0", "1"], {
      message: "You need to select.",
    }),
  })
  .refine(
    (data) => {
      if (data.title === "Other") {
        return data.otherTitle && data.otherTitle.trim() !== "";
      }
      return true;
    },
    {
      message: "Field is required.",
      path: ["otherTitle"],
    }
  )
  .refine(
    (data) => {
      if (data.author === "1") {
        return data.paperTitle && data.paperTitle.trim() !== "";
      }
      return true;
    },
    {
      message: "Paper title is required for authors.",
      path: ["paperTitle"],
    }
  );

export function AsiaCryptForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: undefined,
      otherTitle: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      dateOfBirth: undefined,
      nationality: "",
      institute: "",
      paperTitle: "",
      academicProfile: "",
      conferenceInterests: "",
      iacrExperience: "",
    },
  });

  // 监听表单值的变化
  const title = form.watch("title");
  const author = form.watch("author");

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const date = new Date(values.dateOfBirth);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const response = await fetch("/api/asiacrypt-visa-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          dateOfBirth: dateString,
          type: 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit form");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit form:", error);
      // 这里你可以添加错误提示UI
      alert("提交失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {isSubmitted ? (
          <SuccessMessage />
        ) : (
          <Card className="bg-white shadow-lg border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-slate-800 text-center">
                <div className="flex flex-col items-center">
                  <span>AsiaCrypt 2025 - Visa Invitation Letter</span>
                  <span className="text-lg font-normal text-slate-600 mt-2">
                    Visa Invitation Letter Request Form
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Title <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="Professor"
                                id="professor"
                              />
                              <label htmlFor="professor">Professor</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="A/Professor"
                                id="associate-professor"
                              />
                              <label htmlFor="associate-professor">
                                A/Professor
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Dr" id="dr" />
                              <label htmlFor="dr">Dr</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Mr" id="mr" />
                              <label htmlFor="mr">Mr</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Ms" id="ms" />
                              <label htmlFor="ms">Ms</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Miss" id="miss" />
                              <label htmlFor="miss">Miss</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Other" id="other-title" />
                              <label htmlFor="other-title">Other</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Other Title - conditional field */}
                  {title === "Other" && (
                    <FormField
                      control={form.control}
                      name="otherTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Please enter your title"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* First Name */}
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          First Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your first name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Middle Name */}
                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your middle name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Last Name */}
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Last Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your last name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Contact Email<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Date of Birth */}
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Date of birth <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  {/* Nationality */}
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nationality <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your nationality"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Institute */}
                  <FormField
                    control={form.control}
                    name="institute"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Institute <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your institution"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Paper Type */}
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          Are you an author？{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="1" />
                              </FormControl>
                              <FormLabel className="font-normal">Yes</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="0" />
                              </FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Paper Title */}
                  {author === "1" && (
                    <FormField
                      control={form.control}
                      name="paperTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            The title of your paper at Asiacrypt 2025, if
                            applicable <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your paper title"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Academic Profile */}
                  <FormField
                    control={form.control}
                    name="academicProfile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Provide a link to your up-to-date Curriculum Vitae
                          (CV) that includes, if applicable, a list of
                          publications <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your academic profile URL"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Conference Interests */}
                  <FormField
                    control={form.control}
                    name="conferenceInterests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          A brief statement explaining your interests in the
                          conference <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your statement"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* IACR Experience */}
                  <FormField
                    control={form.control}
                    name="iacrExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          A list of any recent IACR conferences you have
                          attended and/or a reference in the crypto community
                          who has attended past IACR conferences{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your IACR conference experience"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SuccessMessage() {
  return (
    <Card className="bg-white shadow-lg border-slate-200 text-center p-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        Submission Successful
      </h2>
    </Card>
  );
}
