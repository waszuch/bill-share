'use client';

import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Expense = {
  id: string;
  amount: number;
  paidBy: string;
  splits: {
    id: string;
    userId: string;
    amount: number;
  }[];
};

type Participant = {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type Props = {
  expenses: Expense[];
  participants: Participant[];
  currentUserId: string;
};

type Balance = {
  userId: string;
  name: string;
  balance: number;
};

type Settlement = {
  from: string;
  to: string;
  amount: number;
};

export function BalancesSummary({ expenses, participants, currentUserId }: Props) {
  const getUserName = (userId: string) => {
    const participant = participants.find((p) => p.userId === userId);
    return participant?.user.name || participant?.user.email || 'Unknown';
  };

  const calculateBalances = (): Balance[] => {
    const balances = new Map<string, number>();

    participants.forEach((p) => {
      balances.set(p.userId, 0);
    });

    expenses.forEach((expense) => {
      const currentBalance = balances.get(expense.paidBy) || 0;
      balances.set(expense.paidBy, currentBalance + expense.amount);

      expense.splits.forEach((split) => {
        const currentBalance = balances.get(split.userId) || 0;
        balances.set(split.userId, currentBalance - split.amount);
      });
    });

    return Array.from(balances.entries()).map(([userId, balance]) => ({
      userId,
      name: getUserName(userId),
      balance,
    }));
  };

  const calculateSettlements = (balances: Balance[]): Settlement[] => {
    const creditors = balances.filter((b) => b.balance > 0.01);
    const debtors = balances.filter((b) => b.balance < -0.01);

    const settlements: Settlement[] = [];

    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => a.balance - b.balance);

    const creditorsCopy = creditors.map((c) => ({ ...c }));
    const debtorsCopy = debtors.map((d) => ({ ...d }));

    for (const debtor of debtorsCopy) {
      let remainingDebt = Math.abs(debtor.balance);

      for (const creditor of creditorsCopy) {
        if (remainingDebt < 0.01) break;
        if (creditor.balance < 0.01) continue;

        const settlementAmount = Math.min(remainingDebt, creditor.balance);

        settlements.push({
          from: debtor.userId,
          to: creditor.userId,
          amount: settlementAmount,
        });

        creditor.balance -= settlementAmount;
        remainingDebt -= settlementAmount;
      }
    }

    return settlements;
  };

  const balances = calculateBalances();
  const settlements = calculateSettlements(balances);

  const currentUserBalance = balances.find((b) => b.userId === currentUserId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balances</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentUserBalance && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Your balance</p>
            <p
              className={`text-xl sm:text-2xl font-bold ${
                currentUserBalance.balance > 0.01
                  ? 'text-green-600'
                  : currentUserBalance.balance < -0.01
                  ? 'text-red-600'
                  : 'text-gray-900'
              }`}
            >
              {currentUserBalance.balance > 0.01
                ? `+${currentUserBalance.balance.toFixed(2)} zł`
                : currentUserBalance.balance < -0.01
                ? `-${Math.abs(currentUserBalance.balance).toFixed(2)} zł`
                : 'Settled up'}
            </p>
          </div>
        )}

        {settlements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Who owes whom
            </h4>
            <div className="space-y-2">
              {settlements
                .filter(
                  (s) =>
                    s.from === currentUserId || s.to === currentUserId
                )
                .map((settlement, idx) => {
                  const isYouOwe = settlement.from === currentUserId;
                  const isOweYou = settlement.to === currentUserId;
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm p-3 rounded-lg ${
                        isYouOwe
                          ? 'bg-red-50 border border-red-200'
                          : isOweYou
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-gray-900 break-words">
                        {isYouOwe ? (
                          <>
                            You owe <strong>{getUserName(settlement.to)}</strong>
                          </>
                        ) : isOweYou ? (
                          <>
                            <strong>{getUserName(settlement.from)}</strong> owes
                            you
                          </>
                        ) : (
                          <>
                            {getUserName(settlement.from)} →{' '}
                            {getUserName(settlement.to)}
                          </>
                        )}
                      </span>
                      <span
                        className={`font-semibold shrink-0 ${
                          isYouOwe
                            ? 'text-red-600'
                            : isOweYou
                            ? 'text-green-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {settlement.amount.toFixed(2)} zł
                      </span>
                    </div>
                  );
                })}
            </div>
            {settlements.filter(
              (s) => s.from !== currentUserId && s.to !== currentUserId
            ).length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500 mb-2">Other settlements:</p>
                <div className="space-y-1">
                  {settlements
                    .filter(
                      (s) =>
                        s.from !== currentUserId && s.to !== currentUserId
                    )
                    .map((settlement, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs p-2 bg-gray-50 rounded"
                      >
                        <span className="text-gray-600 break-words">
                          {getUserName(settlement.from)} →{' '}
                          {getUserName(settlement.to)}
                        </span>
                        <span className="font-medium text-gray-700 shrink-0">
                          {settlement.amount.toFixed(2)} zł
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {settlements.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>All settled up!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

