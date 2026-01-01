"use client";

interface TestLinkageProps {
  testIds: string[];
}

export function TestLinkage({ testIds }: TestLinkageProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-700">
        Addresses {testIds.length} test(s):
      </p>
      <p className="mt-1 text-xs text-gray-600">{testIds.join(", ")}</p>
    </div>
  );
}
