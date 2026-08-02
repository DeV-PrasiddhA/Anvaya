from abc import ABC, abstractmethod
from typing import Any


class BasePriceCollector(ABC):
    """Common interface for all market-price collectors."""

    @abstractmethod
    def fetch(self) -> Any:
        """Retrieve raw data from the source."""
        raise NotImplementedError

    @abstractmethod
    def parse(self, raw_data: Any) -> list[dict]:
        """Convert raw source data into structured records."""
        raise NotImplementedError

    def collect(self) -> list[dict]:
        """Fetch and parse data in one operation."""
        raw_data = self.fetch()
        return self.parse(raw_data)