# Copilot Chat – Best Prompts Pack (Editor, CI, Devcontainers, Cost Optimization)

This guide provides proven prompts for GitHub Copilot Chat to optimize your development workflow, reduce costs, and improve code quality in React/TypeScript projects.

---

## 🎯 General Development

### Code Review & Refactoring
```
Review this component for best practices, performance issues, and potential bugs. Suggest improvements.
```

```
Refactor this code to be more maintainable and follow React best practices.
```

### Type Safety
```
Add proper TypeScript types to this function/component. Ensure full type safety.
```

```
Convert this JavaScript file to TypeScript with proper types and interfaces.
```

### Testing
```
Generate unit tests for this component using the testing framework already in the project.
```

```
Add test coverage for edge cases in this function.
```

---

## 🚀 CI/CD Optimization

### Workflow Efficiency
```
Optimize this GitHub Actions workflow to reduce CI minutes. Focus on caching, path filters, and parallel jobs.
```

```
Add path filters to this workflow so it only runs when relevant files change.
```

```
Review this CI workflow for opportunities to reduce billable minutes while maintaining quality.
```

### Testing Strategy
```
How can I structure my tests to run faster in CI? Suggest parallelization or selective test running.
```

```
Add --passWithNoTests flag to test command and explain when to use it.
```

---

## 📦 Devcontainer & Development Environment

### Container Optimization
```
Create a minimal devcontainer configuration for a React/TypeScript project that builds quickly.
```

```
Optimize this devcontainer to reduce build time and storage. Remove unnecessary features.
```

```
What's the most cost-efficient base image for a Node.js devcontainer?
```

### Environment Setup
```
Configure VS Code settings for auto-save, format-on-save, and ESLint integration.
```

```
Add recommended VS Code extensions for React/TypeScript development to devcontainer.json.
```

---

## 💰 Cost Optimization

### Actions Minutes
```
Analyze this workflow for cost optimization. How can I reduce GitHub Actions minutes?
```

```
What's the best timeout value for this job type? Currently set to X minutes.
```

```
Should I use actions/cache or built-in caching for npm? Which is more efficient?
```

### Codespaces
```
How can I reduce Codespaces costs while maintaining developer productivity?
```

```
What's the recommended prebuild strategy for this repository to minimize Codespaces startup time?
```

---

## 🛠️ React/TypeScript Specific

### Component Patterns
```
Convert this class component to a functional component with hooks.
```

```
Optimize this component to prevent unnecessary re-renders.
```

```
Extract reusable logic from this component into a custom hook.
```

### State Management
```
Review this state management approach. Is there a simpler way using context or a state library?
```

```
Add proper error handling to this async state update.
```

### Performance
```
Analyze this component for performance bottlenecks. Suggest optimizations like useMemo, useCallback, or code splitting.
```

```
Should this data be fetched on the client or server? Explain the tradeoffs.
```

---

## 🔒 Security & Best Practices

### Code Quality
```
Review this code for security vulnerabilities, especially XSS, injection, or authentication issues.
```

```
Add input validation and sanitization to this form handler.
```

### Dependencies
```
Are there any security concerns with these dependencies? Suggest safer alternatives if needed.
```

```
Review package.json for outdated or vulnerable packages.
```

---

## 📝 Documentation

### Code Documentation
```
Add JSDoc comments to this function explaining parameters, return value, and usage.
```

```
Generate a README section explaining how to run this project locally.
```

### API Documentation
```
Document this API endpoint including request/response types and error codes.
```

---

## 🎨 UI/UX

### Accessibility
```
Review this component for accessibility issues (ARIA labels, keyboard navigation, screen readers).
```

### Responsive Design
```
Make this component responsive and mobile-friendly.
```

---

## 💡 Tips for Better Prompts

1. **Be Specific**: Include context about your project, frameworks, and constraints.
   - ❌ "Optimize this code"
   - ✅ "Optimize this React component to reduce re-renders, focusing on useMemo and useCallback"

2. **Set Constraints**: Mention budget, time, or technical limitations.
   - ✅ "Optimize this CI workflow to stay under 2000 Actions minutes/month"

3. **Ask for Explanations**: Don't just ask for code, ask why.
   - ✅ "Explain why this approach reduces CI time compared to the current implementation"

4. **Iterate**: Start broad, then refine based on responses.
   - First: "Review this component"
   - Then: "Focus on the useEffect hook – could this cause infinite loops?"

5. **Reference Files**: Use @filename to give context.
   - ✅ "@ci.yml Review this workflow for cost optimization"

---

## 🔄 Workflow Integration

### Before Committing
```
Review my changes for potential issues before I commit.
```

### During Code Review
```
Analyze this PR for potential bugs, performance issues, or better approaches.
```

### When Stuck
```
I'm trying to [achieve X] but getting [error Y]. Here's my current approach: [code]. What am I missing?
```

---

## 📊 Measuring Success

Track these metrics to ensure your optimizations are working:

- **CI Minutes Used**: Monitor GitHub Actions usage in Settings → Billing
- **Workflow Duration**: Check average workflow runtime in Actions tab
- **Codespaces Hours**: Track in Settings → Billing
- **Container Build Time**: Measure devcontainer creation time
- **Developer Velocity**: Time from git clone to first commit

---

## 🎓 Best Practices Summary

1. ✅ Use path filters in workflows to skip unnecessary runs
2. ✅ Set appropriate timeouts (10-15 min for most builds)
3. ✅ Use `--passWithNoTests` for projects without tests
4. ✅ Leverage npm cache in setup-node action
5. ✅ Use minimal base images for devcontainers
6. ✅ Enable auto-save and format-on-save to reduce manual work
7. ✅ Set up CODEOWNERS for automated review assignments
8. ✅ Use concurrency groups to cancel redundant workflow runs
9. ✅ Prefer built-in action caching over manual cache actions
10. ✅ Keep devcontainer postCreateCommand minimal (or "true") for fast startup

---

## 📚 Additional Resources

- [GitHub Actions Best Practices](https://docs.github.com/en/actions/learn-github-actions/usage-limits-billing-and-administration)
- [Devcontainer Spec](https://containers.dev/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**Happy Coding with Copilot! 🚀**
