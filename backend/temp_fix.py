#!/usr/bin/env python3
"""
This script fixes an indentation error in main.py file at line 1116.
"""

import re

def fix_indentation_error():
    try:
        # Read the current content of main.py
        with open('main.py', 'r') as file:
            content = file.read()
            lines = content.split('\n')
        
        # Check if we have enough lines
        if len(lines) < 1116:
            print("Error: main.py has fewer than 1116 lines")
            return
        
        # Check line 1115 and 1116 (Python indices would be 1114, 1115)
        print(f"Line 1115: {lines[1114]}")
        print(f"Line 1116: {lines[1115]}")
        
        # Fix the indentation in line 1116 if it looks like an isolated break
        if 'break' in lines[1115] and len(lines[1115].strip()) == 5:
            # Detect the correct indentation from surrounding lines
            # Look at line 1115 (index 1114)
            prev_line_indent = len(lines[1114]) - len(lines[1114].lstrip())
            
            # Ensure the break is properly indented to match its context
            lines[1115] = ' ' * prev_line_indent + lines[1115].strip()
            
            print(f"Fixed line 1116: {lines[1115]}")
            
            # Write the modified content back to the file
            with open('main.py', 'w') as file:
                file.write('\n'.join(lines))
            
            print("Indentation error fixed successfully!")
        else:
            print("Line 1116 doesn't appear to have the expected pattern. Manual inspection needed.")
    
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    fix_indentation_error() 