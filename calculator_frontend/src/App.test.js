import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders calculator display", () => {
  render(<App />);
  expect(screen.getByLabelText(/calculator display/i)).toBeInTheDocument();
});
