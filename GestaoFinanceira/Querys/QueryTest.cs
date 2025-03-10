using System;
using System.Collections.Generic;
using System.Data.SQLite;

namespace QuerysTest
{
    public class DatabaseHelper
    {
        private static string connectionString = @"Data Source=finance.db";

        // Method to retrieve categories from the database
        public static List<string> GetCategories()
        {
            List<string> categories = new List<string>();

            using (var connection = new SQLiteConnection(connectionString))
            {
                connection.Open();

                string query = "SELECT Nome FROM Categoria";

                using (var cmd = new SQLiteCommand(query, connection))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        categories.Add(reader.GetString(0)); // Assuming the 'Nome' column is of type TEXT
                    }
                }
            }

            return categories;
        }

        // Method to execute any command (useful for inserts, updates, deletes)
        public static void ExecuteNonQuery(string commandText, params SQLiteParameter[] parameters)
        {
            using (var connection = new SQLiteConnection(connectionString))
            {
                connection.Open();
                using (var cmd = new SQLiteCommand(commandText, connection))
                {
                    cmd.Parameters.AddRange(parameters);
                    cmd.ExecuteNonQuery();
                }
            }
        }
    }
}
