import math

def calculate_pi(n_terms):
    pi = 0.0
    for i in range(n_terms):
        term = 4 / ((2 * i) + 1)
        if i % 2 == 1:
            term -= (4 / ((2 * i) + 3))
        pi += term

    return pi

n_terms = int(input("Enter the number of terms to calculate Pi: "))
pi_value = calculate_pi(n_terms)

# Attempting to print the result with more precision
print(f"Calculated Pi value (more precise): {round(pi_value, 50)}")

# Testing with a larger number of terms for better accuracy
n_terms_large = 1000000
pi_value_large = calculate_pi(n_terms_large)
print(f"\nCalculated Pi value using {n_terms_large} terms: {pi_value_large}")

# Checking if the calculated pi value matches the known value of pi
known_pi_value = math.pi

# Printing the difference between the known and calculated values
difference = abs(pi_value - known_pi_value)
print(f"Difference between known and calculated Pi values: {difference}")