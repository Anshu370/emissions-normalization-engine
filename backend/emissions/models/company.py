from django.db import models

from common.models import BaseModel


class Company(BaseModel):

    name = models.CharField(max_length=255)

    company_code = models.CharField(
        max_length=50,
        unique=True
    )

    industry = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    country = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "companies"
        ordering = ["name"]

    def __str__(self):
        return self.name