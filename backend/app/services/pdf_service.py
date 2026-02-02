"""
Timesheet Document Generation Service
Fills in the official Florida VR/DOE timesheet template
"""
from io import BytesIO
from datetime import date, time
from typing import Optional, List
import os
from copy import deepcopy

from docx import Document
from docx.shared import Pt


# Path to the template file
TEMPLATE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    'templates',
    'timesheet_template.docx'
)


class TimesheetDocGenerator:
    """Generates filled timesheet documents from the official template"""

    def _format_time(self, t: Optional[time]) -> str:
        """Format time object to string"""
        if t is None:
            return ""
        return t.strftime("%I:%M %p")

    def _format_date(self, d: Optional[date]) -> str:
        """Format date object to string"""
        if d is None:
            return ""
        return d.strftime("%m/%d/%Y")

    def _format_date_short(self, d: Optional[date]) -> str:
        """Format date for table (day + date)"""
        if d is None:
            return ""
        return d.strftime("%a %m/%d")

    def _set_cell_text(self, cell, text: str, bold: bool = False):
        """Set cell text while preserving formatting"""
        # Clear existing paragraphs except the first
        for p in cell.paragraphs[1:]:
            p.clear()

        # Set text in first paragraph
        if cell.paragraphs:
            p = cell.paragraphs[0]
            # Keep existing text (label) and append value
            existing = p.text
            if existing and not existing.endswith(' '):
                existing += ' '
            p.clear()
            run = p.add_run(existing + str(text))
            if bold:
                run.bold = True

    def _set_cell_value(self, cell, text: str):
        """Set just the value in a cell (for data cells)"""
        if cell.paragraphs:
            p = cell.paragraphs[0]
            p.clear()
            run = p.add_run(str(text))
            run.font.size = Pt(10)

    def generate_timesheet(
        self,
        # Participant info
        participant_name: str,
        case_id: Optional[str],
        job_title: Optional[str],
        # Worksite info
        worksite_name: Optional[str],
        supervisor_name: Optional[str],
        worksite_phone: Optional[str],
        # Timesheet data
        entries: List[dict],
        total_hours: float,
    ) -> bytes:
        """
        Generate a filled timesheet document.

        Returns the document as bytes (docx format).
        """
        # Load template
        doc = Document(TEMPLATE_PATH)

        # Employer info is always Career Focus Inc.
        employer_name = "Career Focus Inc."
        employer_address = "6013 Wesley Grove Boulevard, Suite 202, Wesley Chapel, FL 33544"

        # Fill Table 0 - Info section
        info_table = doc.tables[0]

        # Row 0: Participant Name | Case ID Number
        row = info_table.rows[0]
        self._set_cell_text(row.cells[0], participant_name)
        self._set_cell_text(row.cells[1], case_id or "")

        # Row 1: Name of Employer of Record | Place of Employment/Worksite
        row = info_table.rows[1]
        self._set_cell_text(row.cells[0], employer_name)
        self._set_cell_text(row.cells[1], worksite_name or "")

        # Row 2: Participant Job Title | Supervisor Name
        row = info_table.rows[2]
        self._set_cell_text(row.cells[0], job_title or "")
        self._set_cell_text(row.cells[1], supervisor_name or "")

        # Row 3: Employer Address | Employer Phone Number
        row = info_table.rows[3]
        self._set_cell_text(row.cells[0], employer_address)
        self._set_cell_text(row.cells[1], worksite_phone or "")

        # Fill Table 1 - Time entries
        time_table = doc.tables[1]

        # Fill entries starting at row 1 (row 0 is header)
        for i, entry in enumerate(entries):
            if i + 1 >= len(time_table.rows) - 1:  # Leave last row for total
                break

            row = time_table.rows[i + 1]

            entry_date = entry.get('date')
            if isinstance(entry_date, str):
                from datetime import datetime
                entry_date = datetime.strptime(entry_date, '%Y-%m-%d').date()

            # DATE
            self._set_cell_value(row.cells[0], self._format_date_short(entry_date) if entry_date else "")

            # TIME IN (first shift - start time)
            self._set_cell_value(row.cells[1], self._format_time(entry.get('start_time')))

            # TIME OUT (first shift - lunch out)
            self._set_cell_value(row.cells[2], self._format_time(entry.get('lunch_out')))

            # TIME IN (second shift - lunch in)
            self._set_cell_value(row.cells[3], self._format_time(entry.get('lunch_in')))

            # TIME OUT (second shift - end time)
            self._set_cell_value(row.cells[4], self._format_time(entry.get('end_time')))

            # TOTAL hours for the day
            hours = entry.get('hours', 0)
            self._set_cell_value(row.cells[5], f"{hours:.1f}" if hours > 0 else "")

        # Set total hours in last row
        last_row = time_table.rows[-1]
        if len(last_row.cells) >= 6:
            self._set_cell_value(last_row.cells[5], f"{total_hours:.1f}")

        # Save to bytes
        buffer = BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        return buffer.getvalue()


# Singleton instance
doc_generator = TimesheetDocGenerator()
