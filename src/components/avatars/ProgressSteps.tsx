import { FormStep } from '@/lib/types/forms';

interface ProgressStepsProps {
  steps: FormStep[];
  currentStep: number;
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="relative">
      <div className="absolute top-5 w-full h-0.5 bg-gray-700" />
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <div key={step.title} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 
                ${index === currentStep 
                  ? 'bg-blue-600 text-white' 
                  : index < currentStep 
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400'}`}
            >
              {index + 1}
            </div>
            <div className="mt-3 text-center">
              <div className={`font-medium ${index === currentStep ? 'text-blue-500' : 'text-gray-300'}`}>
                {step.title}
              </div>
              <div className="text-sm text-gray-400 max-w-[150px]">
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 