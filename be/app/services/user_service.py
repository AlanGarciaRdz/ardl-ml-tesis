from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.user import user_crud
from app.schemas.user import UserCreate, UserUpdate, User as UserSchema

class UserService:
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> UserSchema:
        """Create a new user with business logic validation."""
        # Add any business logic here (e.g., validation rules, default values)
        return user_crud.create(db, obj_in=user_data)
    
    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[UserSchema]:
        """Get users with pagination."""
        return user_crud.get_multi(db, skip=skip, limit=limit)
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[UserSchema]:
        """Get a user by ID."""
        return user_crud.get(db, id=user_id)
    
    @staticmethod
    def update_user(db: Session, user_id: int, user_data: UserUpdate) -> Optional[UserSchema]:
        """Update a user with business logic validation."""
        user = user_crud.get(db, id=user_id)
        if not user:
            return None
        
        # Add any business logic here (e.g., validation rules)
        return user_crud.update(db, db_obj=user, obj_in=user_data)
    
    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        """Delete a user."""
        user = user_crud.get(db, id=user_id)
        if not user:
            return False
        
        user_crud.remove(db, id=user_id)
        return True

user_service = UserService()
