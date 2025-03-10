using System;
using System.Data.SQLite;
using System.IO;

namespace FinanceDBInitializer
{
    public class DatabaseInitializer
    {
        public static void InitializeDatabase()
        {

            // Path to your SQLite database in the Database folder
            string connectionString = @"Data Source=finance.db";

            // Create the database and tables
            using (var connection = new SQLiteConnection(connectionString))
            {
                connection.Open();

                // Create tables
                CreateTables(connection);

                // Insert data into the database
                InsertInitialData(connection);

                Console.WriteLine("Database and tables created successfully.");
            }
        }

        private static void CreateTables(SQLiteConnection connection)
        {
            // SQL commands to create the tables
            string[] createTableCommands = new string[] {
                @"CREATE TABLE IF NOT EXISTS TipoTransacao (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Nome TEXT UNIQUE NOT NULL
                );",
                @"CREATE TABLE IF NOT EXISTS Categoria (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Nome TEXT UNIQUE NOT NULL
                );",
                @"CREATE TABLE IF NOT EXISTS Transacao (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    TipoTransacaoId INTEGER NOT NULL,
                    CategoriaId INTEGER NOT NULL,
                    Valor REAL NOT NULL,
                    Data DATE NOT NULL,
                    FOREIGN KEY (TipoTransacaoId) REFERENCES TipoTransacao(Id),
                    FOREIGN KEY (CategoriaId) REFERENCES Categoria(Id)
                );",
                @"CREATE TABLE IF NOT EXISTS MetaFinanceira (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    CategoriaId INTEGER NOT NULL,
                    ValorLimite REAL NOT NULL,
                    PeriodoInicio DATE NOT NULL,
                    PeriodoFim DATE NOT NULL,
                    FOREIGN KEY (CategoriaId) REFERENCES Categoria(Id)
                );"
            };

            // Execute each SQL command to create the tables
            foreach (var command in createTableCommands)
            {
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = command;
                    cmd.ExecuteNonQuery();
                }
            }
        }

        private static void InsertInitialData(SQLiteConnection connection)
        {
            // Insert data into TipoTransacao
            string[] tipoTransacaoValues = new string[] {
                "Despesa", "Receita"
            };

            foreach (var tipo in tipoTransacaoValues)
            {
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = "INSERT OR IGNORE INTO TipoTransacao (Nome) VALUES (@Nome)";
                    cmd.Parameters.AddWithValue("@Nome", tipo);
                    cmd.ExecuteNonQuery();
                }
            }

            // Insert data into Categoria
            string[] categoriaValues = new string[] {
                "Alimentação", "Uber/Transporte", "Lazer", "Academia", "Assinaturas",
                "Vestuário", "Saúde", "Outros"
            };

            foreach (var categoria in categoriaValues)
            {
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText = "INSERT OR IGNORE INTO Categoria (Nome) VALUES (@Nome)";
                    cmd.Parameters.AddWithValue("@Nome", categoria);
                    cmd.ExecuteNonQuery();
                }
            }
        }
    }
}
