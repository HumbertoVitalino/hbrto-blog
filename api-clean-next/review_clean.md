# Clean Code — What I Learned, What I Disagree With, and What You'll Figure Out Without Reading It

> **TL;DR:** *Clean Code* isn't exactly a stroke of genius. For the most part, what Uncle Bob did was gather best practices that had been circulating since the 70s and organize them into a single book. Because of that, any developer who genuinely cares about readable and maintainable code will inevitably reach the same conclusions on their own — with or without the book.

---

## The Two-Hour Discussion

I'll be honest: for a long time, I had a pretty negative view of *Clean Code*.

It came from a previous job where the book's concepts were taken way too seriously. The kind of environment where a simple decision turned into a meeting, and a single line of code could spark hours of debate with no real benefit to the product.

The code that generated a **two-hour discussion between four developers** was the following, inside a unit test:

```csharp
public void VerifyLog(int times)
{
    _logger.Verify(
        x => x.Log(
            LogLevel.Information,
            It.IsAny<EventId>(),
            It.IsAny<It.IsAnyType>(),
            It.IsAny<Exception>(),
            It.IsAny<Func<It.IsAnyType, Exception, string>>()),
        Times.Exactly(times));
}
```

The debate revolved around using fixtures in unit tests — two senior developers, two hours, verbosity with no real perceptible benefit.

So when this book showed up as part of my personal development plan, I decided to give it a second chance — this time with the goal of not just absorbing the concepts, but also identifying where I disagreed with Uncle Bob. (Thanks to Tiago for the recommendation.)

And that's where what I actually want to write about begins.

---

## 1. The Language of Code Matters More Than You'd Think

The book, at no point, explicitly discusses writing code in English. That makes sense: it was written in the context of Americans building software for other Americans.

When researching the topic, I found plenty of people arguing that requiring English creates an extra barrier for those learning to code. I understand the argument — but I disagree.

In my experience, the problem isn't English itself. The problem is **mixing languages within the same codebase**. When part of it is in Portuguese, part in English, and the language itself already has its keywords in English, your brain has to context-switch on every line.

Compare the two examples below:

```csharp
// Mixed languages — hurts readability
public async Task<List<ReviewResponse>> BuscarReviewsUsuario(
    Guid usuarioId,
    DateTime reviewDate)
{
    var userReviews = await _reviewRepository.GetUserReviews(
        usuarioId,
        reviewDate);

    return userReviews
        .Select(review => new ReviewResponse(
            review.AuthorName,
            review.CreatedAt,
            review.Content))
        .ToList();
}
```

```csharp
// Consistent language — easier to follow
public async Task<List<ReviewResponse>> GetUserReviews(
    Guid userId,
    DateTime reviewDate)
{
    var userReviews = await _reviewRepository.GetUserReviews(
        userId,
        reviewDate);

    return userReviews
        .Select(review => new ReviewResponse(
            review.AuthorName,
            review.CreatedAt,
            review.Content))
        .ToList();
}
```

Consistency matters more than which language you pick. And since all technical documentation, libraries, frameworks, error messages, and community discussions happen in English — at some point, every developer will have to get comfortable with it anyway.

---

## 2. The Book Has Age — and That's Context, Not Criticism

*Clean Code* was published in 2008. That alone means several versions of Java — the language used in the examples — have shipped since then, alongside new tools, new paradigms, and completely different ways of solving problems.

A significant portion of the book simply doesn't make as much sense in today's context. That doesn't diminish its importance. Software engineering evolves, and a solid technical book from 2008 aged exactly as you'd expect.

A concrete example: there's an entire chapter dedicated to **code formatting**. Today, most of what's discussed there gets resolved in seconds with modern tooling.

In the JavaScript/TypeScript ecosystem:

```bash
npm install --save-dev prettier
```

In Visual Studio:

```
Ctrl + K, Ctrl + D
```

Done. Indentation, spacing, visual organization — automated. Tools like Prettier, ESLint, EditorConfig, and Roslyn analyzers have solved most of the mechanical problems that used to require manual debate in code review.

This reinforces the most important takeaway about the book: **treat its concepts as principles, not laws**. The value of *Clean Code* lies in teaching you how to think about readability and maintainability — not in blindly following every recommendation as if the 2008 context still applied.

And if you manage to follow everything exactly as Uncle Bob prescribes, without questioning a thing, you'll probably become a great Java developer. lol

---

## 3. Early Return: The Rule That Makes the Most Sense

Avoiding nested `if/else` in favor of early returns is one of the recommendations I agree with most — and apply without hesitation.

The difference in readability is immediate:

```csharp
// Hard to follow — the happy path is buried in the middle
public decimal CalculateDiscount(User user, Order order)
{
    if (user != null)
    {
        if (order != null)
        {
            if (order.Total > 100)
            {
                return order.Total * 0.1m;
            }
            else
            {
                return 0;
            }
        }
        else
        {
            throw new ArgumentNullException(nameof(order));
        }
    }
    else
    {
        throw new ArgumentNullException(nameof(user));
    }
}
```

```csharp
// Clear — guards stay at the top, happy path becomes obvious
public decimal CalculateDiscount(User user, Order order)
{
    if (user is null) throw new ArgumentNullException(nameof(user));
    if (order is null) throw new ArgumentNullException(nameof(order));
    if (order.Total <= 100) return 0;

    return order.Total * 0.1m;
}
```

Deeply nested code hides intent and increases cognitive load for no reason. I'd be annoying in a pull request about this — no regrets.

---

## 4. KISS: Simplicity Is Not the Same as Naivety

Here I have a more careful disagreement.

KISS *(Keep It Simple, Stupid)* makes sense as a general principle — but misread, it becomes a justification for solutions that ignore the real complexity of the problem. **Simplicity needs to be proportional to the difficulty of what you're solving.**

A classic example: a bank transfer.

```csharp
// "Simple" — but dangerous
public async Task Transfer(Guid fromId, Guid toId, decimal amount)
{
    await _accountRepository.Debit(fromId, amount);
    await _accountRepository.Credit(toId, amount);
}
```

What if the credit fails after the debit? What if the request gets processed twice? This "simple" version guarantees neither atomicity nor idempotency — two non-negotiable requirements in financial transactions.

```csharp
// More complex — but correct for the context
public async Task Transfer(TransferCommand command)
{
    await using var transaction = await _dbContext.Database.BeginTransactionAsync();

    try
    {
        if (await _transferRepository.Exists(command.IdempotencyKey))
            return;

        await _accountRepository.Debit(command.FromId, command.Amount);
        await _accountRepository.Credit(command.ToId, command.Amount);
        await _transferRepository.Register(command.IdempotencyKey);

        await transaction.CommitAsync();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

You wouldn't use a bazooka to kill an ant. But you also wouldn't go to war wearing flip-flops.

Excessive simplicity in complex problems isn't elegance — it's negligence. If you knew the bank holding your money was using the "simple" version, would you feel safe?

---

## 5. Comments: When Not to and When to

*Clean Code* is categorical: most of the time, comments are a sign of failure to express yourself through the code itself. I agree almost entirely.

The problem isn't the comment — it's the **type** of comment. Most of what I see day-to-day explains *what* the code does. Which the code itself should already be saying clearly.

```csharp
// Bad — the method name already says this
// Increments counter by 1
counter++;

// Bad — renaming the method would solve the problem
// Check if user has an active premium subscription
if (user.IsPremium && user.SubscriptionEndDate > DateTime.Now)
```

The only comment worth writing is one that explains the **why** — a non-obvious constraint, a decision that will look strange to whoever reads it later, a specific behavior of an external library.

```csharp
// CPF validation uses the Mod11 algorithm, not Luhn (the card standard)
if (!CpfValidator.IsValid(cpf)) return false;

// Stripe requires idempotency keys without hyphens — Guid.ToString("N"), not ToString()
var idempotencyKey = paymentId.ToString("N");
```

If removing the comment wouldn't confuse anyone, it probably didn't need to exist.

---

## 6. The Imbalance Between Importance and Attention

A more structural criticism of the book: Uncle Bob distributes attention in a pretty uneven way.

There's an extensive chapter dedicated to variable naming. It's a relevant topic — but not relevant enough to warrant that much space, especially since, in practice, good names come from experience and reading code, not from memorized rules.

At the same time, topics like system design, dependency management, and testing — which have a much more direct impact on day-to-day work — get less depth than they deserve.

This doesn't invalidate the book. But it's a good reminder that **the weight of an idea inside a book doesn't necessarily reflect its weight in practice**. Read with that filter on.

---

## Conclusion

Overall, *Clean Code* brings genuinely valuable insights on how to think about readability, maintainability, and clarity of intent. That's non-negotiable.

But the book has age, was written in a specific context, and carries a volume of recommendations that no developer consciously applies every day — nor should they try.

When I started programming, someone told me: *you need to write a lot of bad code before you learn to write good code.* Over time, I realized that's completely true. I wrote plenty of ugly hacks along the way, and I learned a lot from every single one of them.

In practice, the biggest quality leap I had didn't come from reading books — it came from analyzing code reviews from people better than me, from reading code that actually worked and understanding why it was well written. (Special shoutout to Igor, Gabriel, and Giovanni — great teachers, even if they didn't know it.)

So here's my real advice: **read code**. As Uncle Bob himself says, code is read far more than it's written. Read good code, understand the decisions behind it, and build your repertoire from there.

With AI, it's inevitable that a large portion of mechanical tasks will be automated. But if you're still learning, don't skip the step of reading and understanding the code in front of you — that changes everything. At least, it's what changed mine.
