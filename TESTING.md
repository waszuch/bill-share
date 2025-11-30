# Testowanie w projekcie Bill Share

Ten projekt używa **Jest** + **React Testing Library** do testowania komponentów i logiki aplikacji.

## 🚀 Uruchamianie testów

### Podstawowe komendy:

```bash
# Uruchom wszystkie testy
pnpm test

# Uruchom testy w trybie watch (automatyczne odświeżanie)
pnpm test:watch

# Uruchom testy z pokryciem kodu (coverage)
pnpm test:coverage
```

## 📁 Struktura testów

Testy znajdują się obok testowanych komponentów w folderach `__tests__`:

```
src/
  components/
    ui/
      button.tsx
      __tests__/
        button.test.tsx
    rooms/
      RoomCard.tsx
      __tests__/
        RoomCard.test.tsx
```

## ✍️ Pisanie testów

### Przykład prostego testu komponentu:

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '../button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Test z interakcjami użytkownika:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('handles click events', async () => {
  const handleClick = jest.fn();
  const user = userEvent.setup();
  
  render(<Button onClick={handleClick}>Click me</Button>);
  await user.click(screen.getByText('Click me'));
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Test komponentu z React Query:

```typescript
import { renderWithProviders } from '@/test-utils/test-utils';

it('renders with providers', () => {
  renderWithProviders(<MyComponent />);
  // ... assertions
});
```

## 🛠️ Mockowanie

### Mockowanie modułów:

```typescript
// Mockowanie Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mockowanie tRPC
jest.mock('@/trpc/client', () => ({
  useTRPC: () => mockTRPCClient,
}));
```

## 📊 Coverage

Po uruchomieniu `pnpm test:coverage` zobaczysz raport pokrycia kodu:

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   85.5  |   78.3   |   90.2  |   86.1  |
--------------------|---------|----------|---------|---------|
```

Raporty HTML znajdziesz w folderze `coverage/`.

## 📚 Dobre praktyki

1. **Testuj zachowanie, nie implementację** - testuj co komponent robi, nie jak to robi
2. **Używaj screen queries** - `screen.getByRole()`, `screen.getByLabelText()`
3. **Async tests** - zawsze używaj `await` z `userEvent` i `waitFor`
4. **Cleanup** - React Testing Library automatycznie czyści po każdym teście
5. **Mock tylko co potrzeba** - nie mockuj wszystkiego na raz

## 🔗 Przydatne linki

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🐛 Debugging

```typescript
import { screen } from '@testing-library/react';

// Wyświetl aktualny DOM
screen.debug();

// Wyświetl konkretny element
screen.debug(screen.getByText('Hello'));
```

## ⚡ Tips

- Jeśli test zawiesza się, sprawdź czy używasz `await` z async operacjami
- Używaj `screen.logTestingPlaygroundURL()` do generowania selektorów
- `data-testid` używaj tylko w ostateczności - preferuj semantic queries



