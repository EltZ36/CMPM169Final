#from gpt and asking about file io and getting the lines and having 500 lines 
import random

# Open the file for reading
with open("incidentaddress.txt", "r") as file:
    # Read all lines from the file
    lines = file.readlines()
    #print(lines) 

# Open a new file for writing
with open("filtered_file.txt", "w") as filtered_file:
    # Iterate through each line
    for line in lines:
        # Strip leading and trailing whitespace, including newline characters
        line = line.strip()
        # Check if the stripped line starts with "CA_"
        if "CA_" in line:
            # If it does, write it to the new file
            filtered_file.write(line + "\n") 

# Open the filtered file for reading
with open("filtered_file.txt", "r") as filtered_file2:
    # Read all lines from the filtered file
    lines = filtered_file2.readlines()

# Select 500 random lines from the filtered file
random_lines = random.sample(lines, 500)

# Open a new file for writing the selected random lines
with open("random_lines.txt", "w") as random_file:
    # Write the selected random lines to the new file
    random_file.writelines(random_lines)

#have to do some type of parsing of the data first 