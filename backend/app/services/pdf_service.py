"""
PDF Timesheet Generation Service
Generates timesheets matching the JotForm format
"""
from io import BytesIO
from datetime import date, time
from typing import Optional, List
import base64

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


class TimesheetPDFGenerator:
    """Generates PDF timesheets matching JotForm layout"""

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='Header',
            parent=self.styles['Heading1'],
            fontSize=16,
            alignment=TA_CENTER,
            spaceAfter=12
        ))
        self.styles.add(ParagraphStyle(
            name='SubHeader',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            spaceAfter=20
        ))
        self.styles.add(ParagraphStyle(
            name='FieldLabel',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.grey
        ))
        self.styles.add(ParagraphStyle(
            name='FieldValue',
            parent=self.styles['Normal'],
            fontSize=10,
            fontName='Helvetica-Bold'
        ))

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

    def _get_day_name(self, d: date) -> str:
        """Get day name from date"""
        return d.strftime("%A")

    def generate_timesheet_pdf(
        self,
        # Student/Participant info
        case_id: Optional[str],
        student_name: str,
        student_email: str,
        job_title: Optional[str],
        student_address: Optional[str],
        # Worksite info
        worksite_name: str,
        worksite_phone: Optional[str],
        supervisor_name: Optional[str],
        # Timesheet info
        week_start: date,
        week_end: date,
        entries: List[dict],
        total_hours: float,
        # Signature
        signature_base64: Optional[str],
        signature_date: Optional[date],
    ) -> bytes:
        """
        Generate a PDF timesheet

        Args:
            case_id: Participant ID
            student_name: Full name of the student
            student_email: Student email address
            job_title: Job title
            student_address: Student address
            worksite_name: Name of worksite/employer
            worksite_phone: Worksite phone number
            supervisor_name: Name of supervisor
            week_start: Start of the week
            week_end: End of the week
            entries: List of daily entries with date, hours, start_time, end_time, lunch_in, lunch_out
            total_hours: Total hours for the week
            signature_base64: Base64-encoded signature image
            signature_date: Date of signature

        Returns:
            PDF bytes
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.5*inch,
            leftMargin=0.5*inch,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch
        )

        elements = []

        # Header
        elements.append(Paragraph("WBLE Participant Timesheet", self.styles['Header']))
        elements.append(Paragraph(
            f"Week of {self._format_date(week_start)} - {self._format_date(week_end)}",
            self.styles['SubHeader']
        ))

        # Participant Information Section
        info_data = [
            ['Case ID:', case_id or 'N/A', 'Name:', student_name],
            ['Email:', student_email, 'Job Title:', job_title or 'N/A'],
            ['Worksite:', worksite_name, 'Phone:', worksite_phone or 'N/A'],
            ['Supervisor:', supervisor_name or 'N/A', 'Address:', student_address or 'N/A'],
        ]

        info_table = Table(info_data, colWidths=[1*inch, 2.25*inch, 1*inch, 2.75*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.grey),
            ('TEXTCOLOR', (2, 0), (2, -1), colors.grey),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BACKGROUND', (0, 0), (-1, -1), colors.Color(0.97, 0.97, 0.97)),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.grey),
            ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.lightgrey),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 20))

        # Time Entries Table Header
        time_header = [
            'Day', 'Date', 'Hours', 'Time In', 'Lunch Out', 'Lunch In', 'Time Out'
        ]

        # Build entries rows
        time_data = [time_header]
        for entry in entries:
            entry_date = entry.get('date')
            if isinstance(entry_date, str):
                from datetime import datetime
                entry_date = datetime.strptime(entry_date, '%Y-%m-%d').date()

            row = [
                self._get_day_name(entry_date) if entry_date else '',
                self._format_date(entry_date) if entry_date else '',
                f"{entry.get('hours', 0):.1f}" if entry.get('hours', 0) > 0 else '-',
                self._format_time(entry.get('start_time')),
                self._format_time(entry.get('lunch_out')),
                self._format_time(entry.get('lunch_in')),
                self._format_time(entry.get('end_time')),
            ]
            time_data.append(row)

        # Add total row
        time_data.append(['', '', '', '', '', '', ''])
        time_data.append(['', 'TOTAL HOURS:', f'{total_hours:.1f}', '', '', '', ''])

        time_table = Table(
            time_data,
            colWidths=[1*inch, 1*inch, 0.75*inch, 1*inch, 1*inch, 1*inch, 1*inch]
        )
        time_table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.2, 0.4, 0.6)),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),

            # Data rows
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (2, 1), (2, -1), 'CENTER'),  # Hours column
            ('ALIGN', (3, 1), (-1, -1), 'CENTER'),  # Time columns

            # Total row
            ('FONTNAME', (1, -1), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (1, -1), (2, -1), 10),
            ('BACKGROUND', (0, -1), (-1, -1), colors.Color(0.9, 0.95, 1.0)),

            # Grid
            ('BOX', (0, 0), (-1, -1), 1, colors.grey),
            ('INNERGRID', (0, 0), (-1, -3), 0.5, colors.lightgrey),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),

            # Alternating row colors
            *[('BACKGROUND', (0, i), (-1, i), colors.Color(0.97, 0.97, 0.97))
              for i in range(2, len(time_data)-2, 2)],
        ]))
        elements.append(time_table)
        elements.append(Spacer(1, 30))

        # Signature Section
        sig_elements = []

        # Certification text
        cert_text = Paragraph(
            "I certify that the hours reported above are accurate and complete to the best of my knowledge.",
            ParagraphStyle(
                name='Certification',
                parent=self.styles['Normal'],
                fontSize=9,
                spaceAfter=15
            )
        )
        sig_elements.append(cert_text)

        # Signature row
        sig_data = [['Participant Signature:', '', 'Date:']]
        sig_values = ['', '', self._format_date(signature_date) if signature_date else '']

        # If we have a signature, add it as an image
        if signature_base64:
            try:
                # Remove data URL prefix if present
                if ',' in signature_base64:
                    signature_base64 = signature_base64.split(',')[1]

                sig_bytes = base64.b64decode(signature_base64)
                sig_buffer = BytesIO(sig_bytes)
                sig_image = Image(sig_buffer, width=2*inch, height=0.5*inch)
                sig_values[1] = sig_image
            except Exception:
                sig_values[1] = '[Signature on file]'
        else:
            sig_values[1] = ''

        sig_data.append(sig_values)

        sig_table = Table(sig_data, colWidths=[1.5*inch, 3*inch, 2.5*inch])
        sig_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.grey),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('LINEBELOW', (1, 1), (1, 1), 1, colors.black),
            ('LINEBELOW', (2, 1), (2, 1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
        ]))

        elements.append(Spacer(1, 20))
        elements.append(cert_text)
        elements.append(sig_table)

        # Footer
        elements.append(Spacer(1, 30))
        footer_text = Paragraph(
            "This timesheet is submitted electronically through the WBLE Portal.",
            ParagraphStyle(
                name='Footer',
                parent=self.styles['Normal'],
                fontSize=8,
                textColor=colors.grey,
                alignment=TA_CENTER
            )
        )
        elements.append(footer_text)

        # Build PDF
        doc.build(elements)
        return buffer.getvalue()


# Singleton instance
pdf_generator = TimesheetPDFGenerator()
