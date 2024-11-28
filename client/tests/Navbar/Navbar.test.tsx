import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom"; 
import Navbar from "../../src/Navbar/Navbar"; 
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as useUserHook from  "../../src/hooks/UseUser";
import React from "react";

describe("Navbar Component", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      localStorage.clear();
    });
  
    it("renders the Navbar component correctly", () => {
        vi.spyOn(useUserHook, "useUser").mockReturnValue({
          firstName: "John",
          lastName: "Doe",
          role: "instructor",
        });
      
        render(
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        );
      
        const logo = screen.getByText("John Doe");
        expect(logo).toBeInTheDocument();
      
        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Summary of Results")).toBeInTheDocument();
      
        expect(screen.getByText("Logout")).toBeInTheDocument();
      
        const chatButton = document.querySelector(".chat-icon-button");
        expect(chatButton).toBeTruthy();
      });
  
    it("shows the correct links based on the user's role", () => {
      vi.spyOn(useUserHook, "useUser").mockReturnValue({
        firstName: "Jane",
        lastName: "Smith",
        role: "student",
      });
  
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );
  
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
      expect(screen.queryByText(/Summary of Results/i)).not.toBeInTheDocument();
    });
  
    it("toggles the chat sidebar when the chat button is clicked", () => {
        vi.spyOn(useUserHook, "useUser").mockReturnValue({
          firstName: "Test",
          lastName: "User",
          role: "student",
        });
      
        render(
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        );
      
        const chatButton = document.querySelector(".chat-icon-button");
        expect(chatButton).toBeTruthy();
      
        const chatSidebar = document.querySelector(".chat-sidebar");
        expect(chatSidebar).not.toHaveClass("open");
      
        fireEvent.click(chatButton);
        expect(chatSidebar).toHaveClass("open");
      
        fireEvent.click(chatButton);
        expect(chatSidebar).not.toHaveClass("open");
    });
      
      it("toggles the mobile menu when the mobile menu button is clicked", () => {
        vi.spyOn(useUserHook, "useUser").mockReturnValue({
          firstName: "Test",
          lastName: "User",
          role: "student",
        });
      
        render(
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        );
      
        const mobileMenuButton = document.querySelector(".mobile-menu-icon");
        expect(mobileMenuButton).toBeTruthy();
      
        const navLinks = document.querySelector(".nav-links");
        expect(navLinks).not.toHaveClass("nav-links-mobile");
      
        fireEvent.click(mobileMenuButton);
        expect(navLinks).toHaveClass("nav-links-mobile");
      
        fireEvent.click(mobileMenuButton);
        expect(navLinks).not.toHaveClass("nav-links-mobile");
      });

      it("renders instructor-specific links correctly", () => {
        vi.spyOn(useUserHook, "useUser").mockReturnValue({
          firstName: "John",
          lastName: "Doe",
          role: "instructor",
        });
      
        render(
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        );
      
        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Summary of Results")).toBeInTheDocument();
      
        expect(screen.queryByText("Borrow Book")).not.toBeInTheDocument();
      });


      
  });