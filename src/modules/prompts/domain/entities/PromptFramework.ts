// Prompt engineering framework definitions based on industry standards

export type FrameworkType = "COSTAR" | "CRISPE" | "RACE" | "BASIC" | "FREEFORM";

export interface FrameworkField {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  required: boolean;
  maxLength: number;
}

export interface PromptFramework {
  id: FrameworkType;
  name: string;
  description: string;
  fields: FrameworkField[];
}

// COSTAR Framework: Context, Objective, Style, Tone, Audience, Response
export const COSTAR_FRAMEWORK: PromptFramework = {
  id: "COSTAR",
  name: "COSTAR Framework",
  description: "Structured framework for comprehensive prompt design (Context, Objective, Style, Tone, Audience, Response)",
  fields: [
    {
      key: "context",
      label: "Context",
      description: "Background information and situation",
      placeholder: "e.g., You are analyzing customer feedback for a SaaS product...",
      required: true,
      maxLength: 1000,
    },
    {
      key: "objective",
      label: "Objective",
      description: "The goal or business aim",
      placeholder: "e.g., Generate actionable insights to improve user retention...",
      required: true,
      maxLength: 500,
    },
    {
      key: "style",
      label: "Style",
      description: "Communication approach",
      placeholder: "e.g., Professional, analytical, data-driven...",
      required: false,
      maxLength: 300,
    },
    {
      key: "tone",
      label: "Tone",
      description: "Emotional quality of the response",
      placeholder: "e.g., Empathetic, constructive, optimistic...",
      required: false,
      maxLength: 300,
    },
    {
      key: "audience",
      label: "Audience",
      description: "Who will receive the response",
      placeholder: "e.g., Product managers, executives, technical team...",
      required: false,
      maxLength: 300,
    },
    {
      key: "response",
      label: "Response Format",
      description: "Expected output format",
      placeholder: "e.g., Bullet points, JSON, detailed report...",
      required: true,
      maxLength: 300,
    },
  ],
};

// CRISPE Framework: Capacity, Insight, Statement, Personality, Experiment
export const CRISPE_FRAMEWORK: PromptFramework = {
  id: "CRISPE",
  name: "CRISPE Framework",
  description: "OpenAI's strategic framework for technical and strategic contexts (Capacity, Insight, Statement, Personality, Experiment)",
  fields: [
    {
      key: "capacity",
      label: "Capacity/Role",
      description: "Sets the model's role or capability",
      placeholder: "e.g., Act as an expert software architect...",
      required: true,
      maxLength: 500,
    },
    {
      key: "insight",
      label: "Insight",
      description: "Core idea or knowledge to surface",
      placeholder: "e.g., Focus on scalability patterns in microservices...",
      required: true,
      maxLength: 800,
    },
    {
      key: "statement",
      label: "Statement",
      description: "Frames the core output or task",
      placeholder: "e.g., Design a scalable architecture for...",
      required: true,
      maxLength: 500,
    },
    {
      key: "personality",
      label: "Personality/Tone",
      description: "Adds tone control",
      placeholder: "e.g., Be concise, pragmatic, and example-driven...",
      required: false,
      maxLength: 300,
    },
    {
      key: "experiment",
      label: "Experiment",
      description: "Space to iterate and improve",
      placeholder: "e.g., Provide 3 alternative approaches with trade-offs...",
      required: false,
      maxLength: 300,
    },
  ],
};

// RACE Framework: Role, Action, Context, Execute
export const RACE_FRAMEWORK: PromptFramework = {
  id: "RACE",
  name: "RACE Framework",
  description: "Clear structured prompts for precise outputs (Role, Action, Context, Execute)",
  fields: [
    {
      key: "role",
      label: "Role",
      description: "The persona assigned to the AI",
      placeholder: "e.g., You are a senior data scientist...",
      required: true,
      maxLength: 500,
    },
    {
      key: "action",
      label: "Action",
      description: "The specific task to perform",
      placeholder: "e.g., Analyze this dataset and identify trends...",
      required: true,
      maxLength: 800,
    },
    {
      key: "context",
      label: "Context",
      description: "Background information",
      placeholder: "e.g., The dataset contains user behavior from Q4 2024...",
      required: true,
      maxLength: 1000,
    },
    {
      key: "execute",
      label: "Execute (Output Format)",
      description: "Output format specifications",
      placeholder: "e.g., Provide a summary with 5 key findings in bullet points...",
      required: true,
      maxLength: 300,
    },
  ],
};

// BASIC Framework: Simplified Role-Task-Format
export const BASIC_FRAMEWORK: PromptFramework = {
  id: "BASIC",
  name: "Basic Framework",
  description: "Simple and effective structure for quick prompts (Role, Task, Format)",
  fields: [
    {
      key: "role",
      label: "Role/Persona",
      description: "Who the AI should act as",
      placeholder: "e.g., You are a creative copywriter...",
      required: true,
      maxLength: 500,
    },
    {
      key: "task",
      label: "Task",
      description: "What needs to be done",
      placeholder: "e.g., Write a compelling product description...",
      required: true,
      maxLength: 1500,
    },
    {
      key: "format",
      label: "Output Format",
      description: "How the output should be structured",
      placeholder: "e.g., 3 paragraphs, persuasive tone, under 200 words...",
      required: false,
      maxLength: 300,
    },
  ],
};

// FREEFORM: Traditional single-field prompt
export const FREEFORM_FRAMEWORK: PromptFramework = {
  id: "FREEFORM",
  name: "Freeform",
  description: "Traditional single-field prompt for maximum flexibility",
  fields: [
    {
      key: "content",
      label: "Prompt Content",
      description: "Write your complete prompt",
      placeholder: "Write your prompt here...",
      required: true,
      maxLength: 10000,
    },
  ],
};

export const FRAMEWORKS: Record<FrameworkType, PromptFramework> = {
  COSTAR: COSTAR_FRAMEWORK,
  CRISPE: CRISPE_FRAMEWORK,
  RACE: RACE_FRAMEWORK,
  BASIC: BASIC_FRAMEWORK,
  FREEFORM: FREEFORM_FRAMEWORK,
};

export const FRAMEWORK_OPTIONS: Array<{ value: FrameworkType; label: string }> = [
  { value: "COSTAR", label: "COSTAR - Comprehensive (Context, Objective, Style, Tone, Audience, Response)" },
  { value: "CRISPE", label: "CRISPE - Strategic (Capacity, Insight, Statement, Personality, Experiment)" },
  { value: "RACE", label: "RACE - Clear & Precise (Role, Action, Context, Execute)" },
  { value: "BASIC", label: "Basic - Simple (Role, Task, Format)" },
  { value: "FREEFORM", label: "Freeform - Traditional" },
];
