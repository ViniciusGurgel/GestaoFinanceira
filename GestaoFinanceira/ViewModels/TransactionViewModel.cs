using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Windows.Input;

namespace GestaoFinanceira.ViewModels
{
    public class TransactionViewModel : INotifyPropertyChanged
    {
        private ObservableCollection<Transaction> _transactions;
        private ObservableCollection<Transaction> _pagedTransactions;
        private int _currentPage;
        private int _itemsPerPage;

        public ObservableCollection<Transaction> Transactions
        {
            get => _transactions;
            set
            {
                _transactions = value;
                OnPropertyChanged();
                UpdatePagedTransactions();
            }
        }

        public ObservableCollection<Transaction> PagedTransactions
        {
            get => _pagedTransactions;
            set
            {
                _pagedTransactions = value;
                OnPropertyChanged();
            }
        }

        public int CurrentPage
        {
            get => _currentPage;
            set
            {
                _currentPage = value;
                OnPropertyChanged();
                UpdatePagedTransactions();
            }
        }

        public int ItemsPerPage
        {
            get => _itemsPerPage;
            set
            {
                _itemsPerPage = value;
                OnPropertyChanged();
                UpdatePagedTransactions();
            }
        }

        public ICommand PreviousPageCommand { get; }
        public ICommand NextPageCommand { get; }

        public TransactionViewModel()
        {
            Transactions = new ObservableCollection<Transaction>();
            PagedTransactions = new ObservableCollection<Transaction>();
            CurrentPage = 1;
            ItemsPerPage = 15;

            PreviousPageCommand = new RelayCommand(PreviousPage, CanGoToPreviousPage);
            NextPageCommand = new RelayCommand(NextPage, CanGoToNextPage);

            // Sample data
            for (int i = 1; i <= 100; i++)
            {
                Transactions.Add(new Transaction
                {
                    Id = i,
                    Tipo = i % 2 == 0 ? "Receita" : "Despesa",
                    Categoria = "Categoria " + i,
                    Valor = i * 10,
                    Data = DateTime.Now.AddDays(-i).ToString("dd/MM/yyyy")
                });
            }
        }

        private void UpdatePagedTransactions()
        {
            if (PagedTransactions == null)
            {
                PagedTransactions = new ObservableCollection<Transaction>();
            }

            PagedTransactions.Clear();
            foreach (var transaction in Transactions.Skip((CurrentPage - 1) * ItemsPerPage).Take(ItemsPerPage))
            {
                PagedTransactions.Add(transaction);
            }
        }

        private void PreviousPage()
        {
            if (CurrentPage > 1)
            {
                CurrentPage--;
            }
        }

        private bool CanGoToPreviousPage()
        {
            return CurrentPage > 1;
        }

        private void NextPage()
        {
            if (CurrentPage < (Transactions.Count + ItemsPerPage - 1) / ItemsPerPage)
            {
                CurrentPage++;
            }
        }

        private bool CanGoToNextPage()
        {
            return CurrentPage < (Transactions.Count + ItemsPerPage - 1) / ItemsPerPage;
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected void OnPropertyChanged([CallerMemberName] string name = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        }
    }

    public class Transaction
    {
        public int Id { get; set; }
        public string Tipo { get; set; }
        public string Categoria { get; set; }
        public double Valor { get; set; }
        public string Data { get; set; }
    }

    public class RelayCommand : ICommand
    {
        private readonly Action _execute;
        private readonly Func<bool> _canExecute;

        public RelayCommand(Action execute, Func<bool> canExecute = null)
        {
            _execute = execute;
            _canExecute = canExecute;
        }

        public bool CanExecute(object parameter)
        {
            return _canExecute == null || _canExecute();
        }

        public void Execute(object parameter)
        {
            _execute();
        }

        public event EventHandler CanExecuteChanged
        {
            add { CommandManager.RequerySuggested += value; }
            remove { CommandManager.RequerySuggested -= value; }
        }
    }
}
