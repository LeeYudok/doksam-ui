import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import RulesPage from "@/app/rules/page";
import { RULES_SECTIONS } from "@/lib/rules-markdown";

describe("RulesPage", () => {
  it("renders the page heading", () => {
    render(<RulesPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Rules" })).toBeInTheDocument();
  });

  it("renders every rule section as a heading", () => {
    render(<RulesPage />);
    for (const section of RULES_SECTIONS) {
      expect(screen.getByRole("heading", { name: section.title })).toBeInTheDocument();
    }
  });

  it("provides a full markdown copy button", () => {
    render(<RulesPage />);
    expect(screen.getByRole("button", { name: "전체 markdown 복사" })).toBeInTheDocument();
  });

  it("절마다 불변/선택 뱃지를 렌더한다(#28)", () => {
    render(<RulesPage />);
    const invariants = RULES_SECTIONS.filter((s) => s.kind === "invariant").length;
    const decisions = RULES_SECTIONS.filter((s) => s.kind === "decision").length;
    expect(screen.getAllByText("불변")).toHaveLength(invariants);
    expect(screen.getAllByText("선택")).toHaveLength(decisions);
  });

  it("디자인 브리프와 수렴 안티패턴 절을 렌더한다(#28)", () => {
    render(<RulesPage />);
    expect(
      screen.getByRole("heading", { level: 2, name: "디자인 브리프 (생성 전 필수)" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "수렴 안티패턴" })).toBeInTheDocument();
  });

  it("mentions the semantic-token-only rule", () => {
    render(<RulesPage />);
    expect(screen.getByText(/시맨틱 토큰/)).toBeInTheDocument();
  });
});
