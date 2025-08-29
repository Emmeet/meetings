"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Form validation schema
const formSchema = z
  .object({
    title: z.enum(["Mr", "Mrs", "Miss", "Other"], {
      message: "Please select a title.",
    }),
    otherTitle: z.string().optional(),
    firstName: z.string().min(1, "This field is required."),
    middleName: z.string().optional(),
    lastName: z.string().min(1, "This field is required."),
    paperNumber: z.string().min(1, "This field is required."),
    paperTitle: z.string().min(1, "This field is required."),
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    institute: z.string().min(1, "This field is required."),
    hasIacr: z.enum(["1", "0"], {
      message: "Please select.",
    }),
    attachments: z
      .any()
      .refine(
        (files) =>
          files && files.length === 1 && files[0].type === "application/pdf",
        { message: "Please upload a PDF file." }
      ),
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
  );

export function StudentRegistrationForm() {
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
      paperNumber: "",
      paperTitle: "",
      email: "",
      institute: "",
      hasIacr: undefined,
      attachments: undefined,
    },
  });

  // 监听表单值的变化
  const title = form.watch("title");

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);

      // 1. 先上传文件到R2
      const file = values.attachments[0];
      const fileForm = new FormData();
      fileForm.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: fileForm,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "文件上传失败");

      // 2. 再保存表单数据到数据库
      const response = await fetch("/api/asiacrypt-visa-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          fileKey: uploadData.fileKey,
          fileName: uploadData.fileName,
          attachments: undefined,
          type: 2,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit form");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit form:", error);
      alert("Submission failed, please try again later.");
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
                  <span>AsiaCrypt 2025</span>
                  <span className="text-lg font-normal text-slate-600 mt-2">
                    Online form for student speaker's registration wavier
                    request
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
                              <RadioGroupItem value="Mr" id="mr" />
                              <label htmlFor="mr">Mr</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Mrs" id="mrs" />
                              <label htmlFor="mrs">Mrs</label>
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

                  {/* Paper Number */}
                  <FormField
                    control={form.control}
                    name="paperNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Accepted Paper Number{" "}
                          <span className="text-red-500">*</span>
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

                  {/* Paper Title */}
                  <FormField
                    control={form.control}
                    name="paperTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Accepted Paper Title{" "}
                          <span className="text-red-500">*</span>
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
                  {/* Has IACR */}
                  <FormField
                    control={form.control}
                    name="hasIacr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Has your IACR dues been paid by registering to an IACR
                          conference earlier in 2025?{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="1" id="yes" />
                              <label htmlFor="yes">Yes</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="0" id="no" />
                              <label htmlFor="no">No</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* File Upload */}
                  <FormField
                    control={form.control}
                    name="attachments"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel>
                          Upload Proof of Student Identity
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <label
                            htmlFor="student-upload"
                            className="border-2 border-dashed border-blue-400 rounded-lg p-4 bg-blue-50 flex flex-col items-center mb-2 cursor-pointer"
                          >
                            <CheckCircle className="w-8 h-8 text-blue-500 mb-2" />
                            <span className="font-semibold text-blue-700 mb-2">
                              Please select a PDF file to upload
                            </span>
                            <Input
                              id="student-upload"
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const files = e.target.files;
                                if (files && files.length > 0) {
                                  onChange(files);
                                }
                              }}
                              {...field}
                            />
                          </label>
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
                          Institution/Affiliation Name{" "}
                          <span className="text-red-500">*</span>
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
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Contact Email (ending with the institution/affiliation
                          domain) <span className="text-red-500">*</span>
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
