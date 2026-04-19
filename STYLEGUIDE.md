# Impoundment System - Design & UI Style Guide

This document outlines the design principles, color palettes, typography, and accessibility standards implemented in the Vehicle Impoundment System.

## 1. Design Principles

*   **Clarity over Decoration:** The UI prioritizes readable data and clear actions. Decorative elements are minimized to focus on the impounding records.
*   **Mobile-First Responsiveness:** All layouts begin with a mobile-optimized view (stacked forms, scrollable tables, hidden secondary columns) and progressively enhance for tablets and desktops (`min-width: 640px` and `min-width: 768px`).
*   **Accessible by Default:** The interface follows WCAG 2.1 AA standards, ensuring high contrast ratios, semantic HTML, and full keyboard navigability.
*   **Immediate Feedback:** User actions (saving, deleting, expanding) are accompanied by immediate visual feedback through toast notifications, hover states, and smooth transitions.

## 2. Color Palette

Our color system uses semantic variables mapped to a robust scale of modern UI colors.

### Primary Colors (Blue)
Used for primary actions, active states, and focus rings.
*   `--color-primary-50` (`#eff6ff`) - Light backgrounds (e.g., active rows)
*   `--color-primary-500` (`#3b82f6`) - Accent borders
*   `--color-primary-600` (`#2563eb`) - **Primary Buttons** (WCAG AA compliant against white text)
*   `--color-primary-700` (`#1d4ed8`) - Button hover states

### Neutral / Grayscale
Used for typography, borders, and surfaces.
*   `--color-gray-50` (`#f8fafc`) - Body background
*   `--color-gray-200` (`#e2e8f0`) - Light borders
*   `--color-gray-600` (`#475569`) - Secondary text (Labels, subtitles)
*   `--color-gray-900` (`#0f172a`) - Primary text (Headings, data)

### Semantic Colors
*   **Danger:** `--color-danger-700` (`#b91c1c`) - Destructive actions (Delete) and danger toasts.
*   **Success:** `--color-success-700` (`#15803d`) - Success toasts.

## 3. Typography

*   **Font Family:** Inter (Primary), system-ui fallbacks.
*   **Receipt Font:** Merriweather/Times New Roman (Used exclusively for the printed receipt simulation to differentiate it from the app UI).
*   **Hierarchy:**
    *   `h1` (Page Title): `1.875rem`, Bold
    *   `h2` (Modal Title): `1.25rem`, Bold
    *   `th` (Table Headers): `0.875rem`, Semi-bold, Uppercase tracking
    *   `body`: `0.95rem` to `1rem`, Regular

## 4. Accessibility (WCAG 2.1 AA)

We have implemented the following accessibility features:

*   **Semantic HTML:** Use of `<main>`, `<header>`, `<section>`, `<article>`, `<fieldset>`, and `<legend>` to provide structural meaning to screen readers.
*   **ARIA Attributes:**
    *   `aria-expanded` and `aria-controls` on expandable table rows.
    *   `aria-label` on icon-only buttons.
    *   `role="dialog"` and `aria-modal="true"` for the entry form modal.
    *   `aria-live="polite"` for the toast notification container.
*   **Keyboard Navigation:**
    *   Custom `:focus-visible` styles with a high-contrast blue focus ring (`box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.4)`).
    *   Table rows are focusable (`tabindex="0"`) and triggerable via the `Enter` key.
    *   The `Escape` key closes the modal.
*   **Contrast Ratios:** All text and interactive elements maintain a minimum contrast ratio of 4.5:1 against their backgrounds.

## 5. Component Library

### Buttons
*   **Primary (`.btn-primary`):** Solid blue background, white text. Used for primary form submissions.
*   **Secondary (`.btn-secondary`):** White background, gray border. Used for cancellations.
*   **Destructive (`.btn-delete`):** Light red background, dark red text. Used for deleting records.

### Forms
*   Labels are explicitly tied to inputs using `for` and `id` attributes.
*   Inputs feature a subtle border that transitions to a solid dark border and focus ring when active.
*   Form sections are grouped using `<fieldset>` for logical grouping.

### Toast Notifications
*   Transient messages that appear at the bottom right.
*   Types: Success (Green) and Danger (Red).
*   Includes SVG icons for quick visual parsing.

## 6. Interaction & Animation Specifications

*   **Hover States:** Subtle background shifts on table rows and buttons.
*   **Transitions:** `0.2s ease` applied to colors, borders, and shadows for smooth state changes.
*   **Modals:** Slide up (`slideUp` keyframes) with a backdrop blur overlay.
*   **Toasts:** Slide in from the right (`slideInRight` keyframes).
