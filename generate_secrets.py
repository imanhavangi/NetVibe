#!/usr/bin/env python3
"""
Secure Secret Generator for NetVibe
Generates cryptographically secure random passwords and secrets for production deployment.
"""

import secrets
import string
import os

def generate_secure_password(length=64):
    """Generate a cryptographically secure random password."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    # Ensure we have at least one of each type
    password = [
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.digits),
        secrets.choice(string.punctuation)
    ]
    # Fill the rest randomly
    password += [secrets.choice(alphabet) for _ in range(length - 4)]
    # Shuffle to avoid predictable patterns
    secrets.SystemRandom().shuffle(password)
    return ''.join(password)

def generate_env_file():
    """Generate a secure .env file with random credentials."""
    postgres_user = "netvibe_admin"
    postgres_password = generate_secure_password(64)
    postgres_db = "netvibe_analytics"
    
    database_url = f"postgresql://{postgres_user}:{postgres_password}@postgres_db/{postgres_db}"
    redis_url = "redis://redis_cache:6379/0"
    submission_rate_limit = "600"
    nginx_port = "8008"
    
    env_content = f"""# PostgreSQL Configuration
POSTGRES_USER={postgres_user}
POSTGRES_PASSWORD={postgres_password}
POSTGRES_DB={postgres_db}

# Redis Configuration
REDIS_URL={redis_url}

# Database Connection URL
DATABASE_URL={database_url}

# Application Settings
SUBMISSION_RATE_LIMIT={submission_rate_limit}

# Nginx Port Mapping (external:internal)
NGINX_PORT={nginx_port}

# Generated: {__import__('datetime').datetime.now().isoformat()}
# KEEP THIS FILE SECURE AND NEVER COMMIT TO VERSION CONTROL!
"""
    
    return env_content

def main():
    """Main function to generate and save secure credentials."""
    env_file_path = ".env"
    
    # Check if .env already exists
    if os.path.exists(env_file_path):
        response = input(f"⚠️  {env_file_path} already exists. Overwrite? (yes/no): ")
        if response.lower() not in ['yes', 'y']:
            print("❌ Aborted. Existing .env file preserved.")
            return
    
    # Generate the .env file
    env_content = generate_env_file()
    
    # Write to file
    with open(env_file_path, 'w') as f:
        f.write(env_content)
    
    # Set restrictive permissions (Unix-like systems only)
    try:
        os.chmod(env_file_path, 0o600)
        print(f"✅ Secure .env file created successfully!")
        print(f"📁 Location: {os.path.abspath(env_file_path)}")
        print(f"🔒 Permissions set to 600 (owner read/write only)")
    except Exception as e:
        print(f"✅ Secure .env file created successfully!")
        print(f"⚠️  Could not set file permissions: {e}")
        print(f"💡 Please manually restrict access to the .env file")
    
    print("\n🔐 Security Checklist:")
    print("  ✓ Random 64-character password generated")
    print("  ✓ Environment variables configured")
    print("  ✓ Ready for docker-compose deployment")
    print("\n⚠️  IMPORTANT:")
    print("  • Keep the .env file secure")
    print("  • Never commit .env to version control")
    print("  • Use different credentials for each environment")
    print("\n🚀 Next steps:")
    print("  1. Review the generated .env file")
    print("  2. Run: docker compose up --build -d")
    print("  3. Access the application at http://localhost:8008")

if __name__ == "__main__":
    main()
