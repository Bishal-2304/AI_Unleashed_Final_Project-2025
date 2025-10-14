#!/usr/bin/env python3
"""
Build script for Eye-Hand Tracker Flask application
Handles building React frontend and preparing Flask backend
"""

import os
import sys
import subprocess
import shutil
import argparse
import json
from pathlib import Path

class BuildScript:
    def __init__(self):
        self.root_dir = Path(__file__).parent.absolute()
        self.frontend_dir = self.root_dir
        self.backend_dir = self.root_dir / "backend"
        self.build_dir = self.root_dir / "build"
        
    def parse_arguments(self):
        """Parse command line arguments"""
        parser = argparse.ArgumentParser(description='Build script for Eye-Hand Tracker')
        parser.add_argument('--env', choices=['dev', 'prod'], default='prod',
                          help='Build environment (dev or prod)')
        parser.add_argument('--clean', action='store_true',
                          help='Clean build directory before building')
        parser.add_argument('--install', action='store_true',
                          help='Install npm dependencies before building')
        parser.add_argument('--skip-frontend', action='store_true',
                          help='Skip frontend build')
        parser.add_argument('--skip-backend', action='store_true',
                          help='Skip backend preparation')
        return parser.parse_args()
    
    def run_command(self, command, cwd=None, shell=False):
        """Run a shell command and handle errors"""
        if cwd is None:
            cwd = self.root_dir
        
        print(f"Running: {command}")
        try:
            if shell:
                result = subprocess.run(command, shell=True, cwd=cwd, check=True, 
                                      capture_output=True, text=True)
            else:
                result = subprocess.run(command.split(), cwd=cwd, check=True, 
                                      capture_output=True, text=True)
            print(result.stdout)
            return True
        except subprocess.CalledProcessError as e:
            print(f"Error running command: {command}")
            print(f"STDERR: {e.stderr}")
            print(f"STDOUT: {e.stdout}")
            return False
    
    def check_node_installed(self):
        """Check if Node.js and npm are installed"""
        try:
            subprocess.run(["node", "--version"], check=True, capture_output=True)
            subprocess.run(["npm", "--version"], check=True, capture_output=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("Error: Node.js and npm are required but not installed")
            print("Please install Node.js from https://nodejs.org/")
            return False
    
    def check_python_installed(self):
        """Check if Python is installed"""
        try:
            subprocess.run(["python", "--version"], check=True, capture_output=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("Error: Python is required but not installed")
            return False
    
    def clean_build_directory(self):
        """Clean the build directory"""
        if self.build_dir.exists():
            print(f"Cleaning build directory: {self.build_dir}")
            shutil.rmtree(self.build_dir)
        self.build_dir.mkdir(exist_ok=True)
    
    def install_dependencies(self):
        """Install npm dependencies"""
        print("Installing npm dependencies...")
        return self.run_command("npm install", cwd=self.frontend_dir)
    
    def build_frontend(self, env='prod'):
        """Build the React frontend"""
        print(f"Building React frontend for {env} environment...")
        
        # Set environment variable for build
        env_cmd = f"npm run build"
        if env == 'dev':
            env_cmd = "VITE_APP_ENV=development npm run build"
        
        return self.run_command(env_cmd, cwd=self.frontend_dir, shell=True)
    
    def prepare_backend(self):
        """Prepare the backend for deployment"""
        print("Preparing Flask backend...")
        
        # Create backend directory in build
        backend_build_dir = self.build_dir / "backend"
        backend_build_dir.mkdir(exist_ok=True)
        
        # Copy backend files
        backend_files = [
            "app.py",
            "requirements.txt",
            "api/",
            "models/"
        ]
        
        for file in backend_files:
            src = self.backend_dir / file
            if src.exists():
                if src.is_dir():
                    dst = backend_build_dir / file
                    shutil.copytree(src, dst, dirs_exist_ok=True)
                else:
                    shutil.copy2(src, backend_build_dir)
        
        # Create production config if needed
        prod_config = backend_build_dir / "config.py"
        if not prod_config.exists():
            with open(prod_config, 'w') as f:
                f.write("DEBUG = False\n")
                f.write("SECRET_KEY = 'your-secret-key-change-in-production'\n")
        
        print("Backend preparation completed")
        return True
    
    def create_deployment_scripts(self):
        """Create deployment scripts"""
        print("Creating deployment scripts...")
        
        # Create startup script for production
        startup_script = self.build_dir / "start.sh"
        with open(startup_script, 'w') as f:
            f.write("#!/bin/bash\n")
            f.write("cd backend\n")
            f.write("pip install -r requirements.txt\n")
            f.write("python app.py\n")
        
        # Make it executable
        startup_script.chmod(0o755)
        
        # Create Windows startup script
        windows_script = self.build_dir / "start.bat"
        with open(windows_script, 'w') as f:
            f.write("@echo off\n")
            f.write("cd backend\n")
            f.write("pip install -r requirements.txt\n")
            f.write("python app.py\n")
            f.write("pause\n")
        
        # Create README
        readme = self.build_dir / "DEPLOYMENT.md"
        with open(readme, 'w') as f:
            f.write("# Deployment Instructions\n\n")
            f.write("## Prerequisites\n")
            f.write("- Python 3.8+\n")
            f.write("- pip\n\n")
            f.write("## Quick Start\n\n")
            f.write("### Linux/Mac\n")
            f.write("```bash\n")
            f.write("chmod +x start.sh\n")
            f.write("./start.sh\n")
            f.write("```\n\n")
            f.write("### Windows\n")
            f.write("```cmd\n")
            f.write("start.bat\n")
            f.write("```\n\n")
            f.write("The application will be available at http://localhost:5000\n")
        
        print("Deployment scripts created")
        return True
    
    def generate_build_info(self, args):
        """Generate build information file"""
        build_info = {
            "timestamp": subprocess.run(["date", "-u"], capture_output=True, text=True).stdout.strip(),
            "git_hash": subprocess.run(["git", "rev-parse", "--short", "HEAD"], 
                                     capture_output=True, text=True).stdout.strip() if not subprocess.run(["git", "rev-parse", "--is-inside-work-tree"], capture_output=True).returncode else "N/A",
            "environment": args.env,
            "frontend_built": not args.skip_frontend,
            "backend_prepared": not args.skip_backend
        }
        
        with open(self.build_dir / "build-info.json", 'w') as f:
            json.dump(build_info, f, indent=2)
    
    def run(self):
        """Main build process"""
        args = self.parse_arguments()
        
        print(f"Starting build process for {args.env} environment...")
        
        # Check prerequisites
        if not args.skip_frontend and not self.check_node_installed():
            sys.exit(1)
        
        if not self.check_python_installed():
            sys.exit(1)
        
        # Clean if requested
        if args.clean:
            self.clean_build_directory()
        
        # Install dependencies if requested
        if args.install and not args.skip_frontend:
            if not self.install_dependencies():
                print("Failed to install dependencies")
                sys.exit(1)
        
        # Build frontend
        if not args.skip_frontend:
            if not self.build_frontend(args.env):
                print("Frontend build failed")
                sys.exit(1)
        
        # Prepare backend
        if not args.skip_backend:
            if not self.prepare_backend():
                print("Backend preparation failed")
                sys.exit(1)
        
        # Create deployment scripts
        self.create_deployment_scripts()
        
        # Generate build info
        self.generate_build_info(args)
        
        print("\n" + "="*50)
        print("BUILD COMPLETED SUCCESSFULLY!")
        print("="*50)
        print(f"Build directory: {self.build_dir}")
        print(f"Frontend built: {not args.skip_frontend}")
        print(f"Backend prepared: {not args.skip_backend}")
        print("\nTo run the application:")
        print("  Linux/Mac: ./build/start.sh")
        print("  Windows:   ./build/start.bat")
        print("\nApplication will be available at http://localhost:5000")

if __name__ == "__main__":
    builder = BuildScript()
    builder.run()