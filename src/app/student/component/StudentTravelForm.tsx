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
    attachments: z
      .any()
      .refine(
        (files) =>
          files && files.length === 1 && files[0].type === "application/pdf",
        { message: "请上传PDF文件" }
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

export function StudentTravelForm() {
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
          type: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit form");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit form:", error);
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
                  <span>AsiaCrypt 2025 - Student Travel Stipends</span>
                  <span className="text-lg font-normal text-slate-600 mt-2">
                    Application for Student Travel Stipends
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
                          1. Title <span className="text-red-500">*</span>
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
                            <Input placeholder="请输入您的称谓" {...field} />
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
                          2. First Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="输入您的名字" {...field} />
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
                        <FormLabel>3. Middle Name</FormLabel>
                        <FormControl>
                          <Input placeholder="输入您的名字" {...field} />
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
                          4. Last Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="输入您的姓氏" {...field} />
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
                          5. Upload a single PDF file with{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>1) the student's CV,</p>
                          <p>2) a statement from the student, and</p>
                          <p>
                            3) a letter from the student's research advisor with
                            a justification of financial need.
                          </p>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          <p>Notes:</p>
                          <p>
                            1. The student's statement should include a summary
                            of research interests and describe how the applicant
                            will benefit from participating in Asiacrypt.
                          </p>
                          <p>
                            2. Statement from supervisor / head of department to
                            include
                          </p>
                          <ul className="list-disc pl-6">
                            <li>
                              why there is a need for funding from the
                              conference, and
                            </li>
                            <li>
                              whether the advisor or institution will provide
                              any funding to complement awarded partial travel
                              grants, as well as a commitment to a maximal
                              dollar value they can contribute.
                            </li>
                          </ul>
                          <p>
                            3. Incomplete applications will not be considered.
                          </p>
                        </div>
                        <FormControl>
                          <Input
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
                    {loading ? "提交中..." : "提交"}
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
      <h2 className="text-2xl font-bold text-slate-900 mb-4">提交成功</h2>
      <p className="text-slate-600 mb-8">
        感谢您的提交，我们会尽快处理您的申请。
      </p>
    </Card>
  );
}
