"""
PDF Timesheet Generation Service
Generates timesheets matching the Florida VR/DOE format
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


# Color definitions matching the form
HEADER_BLUE = colors.Color(0.85, 0.91, 0.96)  # Light blue for header cells
BORDER_COLOR = colors.Color(0.4, 0.4, 0.4)


class TimesheetPDFGenerator:
    """Generates PDF timesheets matching Florida VR/DOE format"""

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='TimesheetTitle',
            parent=self.styles['Heading1'],
            fontSize=12,
            fontName='Helvetica-Bold',
            alignment=TA_CENTER,
            spaceAfter=16,
            spaceBefore=8
        ))
        self.styles.add(ParagraphStyle(
            name='TableHeader',
            parent=self.styles['Normal'],
            fontSize=9,
            fontName='Helvetica-Bold',
            alignment=TA_CENTER
        ))
        self.styles.add(ParagraphStyle(
            name='FieldLabel',
            parent=self.styles['Normal'],
            fontSize=9,
            fontName='Helvetica-Bold'
        ))
        self.styles.add(ParagraphStyle(
            name='FieldValue',
            parent=self.styles['Normal'],
            fontSize=9,
            fontName='Helvetica'
        ))
        self.styles.add(ParagraphStyle(
            name='Footer',
            parent=self.styles['Normal'],
            fontSize=7,
            textColor=colors.grey
        ))
        self.styles.add(ParagraphStyle(
            name='SignatureLabel',
            parent=self.styles['Normal'],
            fontSize=9,
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

    def _format_date_short(self, d: Optional[date]) -> str:
        """Format date object to short string (day of week + date)"""
        if d is None:
            return ""
        return d.strftime("%a %m/%d")

    def generate_timesheet_pdf(
        self,
        # Student/Participant info
        case_id: Optional[str],
        participant_name: str,
        student_email: str,
        job_title: Optional[str],
        student_address: Optional[str],
        # Worksite info
        employer_name: str,
        worksite_name: Optional[str],
        worksite_phone: Optional[str],
        worksite_address: Optional[str],
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
        """Generate a PDF timesheet matching Florida VR/DOE format"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.5*inch,
            leftMargin=0.5*inch,
            topMargin=0.4*inch,
            bottomMargin=0.4*inch
        )

        elements = []

        # Title
        title = Paragraph(
            "ON THE JOB TRAINING/WORK BASED LEARNING EXPERIENCE TIMESHEET",
            self.styles['TimesheetTitle']
        )
        elements.append(title)
        elements.append(Spacer(1, 8))

        # Info Section - 2 column layout
        # Employer info is always Career Focus Inc.
        employer_name_fixed = "Career Focus Inc."
        employer_address_fixed = "6013 Wesley Grove Boulevard, Suite 202, Wesley Chapel, FL 33544"

        info_data = [
            [
                Paragraph("<b>Participant Name:</b>", self.styles['FieldLabel']),
                participant_name,
                Paragraph("<b>Case ID Number:</b>", self.styles['FieldLabel']),
                case_id or ""
            ],
            [
                Paragraph("<b>Name of Employer of Record:</b>", self.styles['FieldLabel']),
                employer_name_fixed,
                Paragraph("<b>Place of Employment/Worksite:</b>", self.styles['FieldLabel']),
                worksite_name or ""
            ],
            [
                Paragraph("<b>Participant Job Title:</b>", self.styles['FieldLabel']),
                job_title or "",
                Paragraph("<b>Supervisor Name:</b>", self.styles['FieldLabel']),
                supervisor_name or ""
            ],
            [
                Paragraph("<b>Employer Address:</b>", self.styles['FieldLabel']),
                employer_address_fixed,
                Paragraph("<b>Employer Phone Number:</b>", self.styles['FieldLabel']),
                worksite_phone or ""
            ],
        ]

        info_table = Table(info_data, colWidths=[1.6*inch, 2.15*inch, 1.7*inch, 2.05*inch])
        info_table.setStyle(TableStyle([
            # Background for label cells
            ('BACKGROUND', (0, 0), (0, -1), HEADER_BLUE),
            ('BACKGROUND', (2, 0), (2, -1), HEADER_BLUE),
            # Borders
            ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            # Padding
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            # Alignment
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 12))

        # Time entries section header
        section_header = Paragraph(
            "<b>COMPLETE TABLE FOR TOTAL HOURS WORKED PER WORK WEEK:</b>",
            ParagraphStyle(
                name='SectionHeader',
                parent=self.styles['Normal'],
                fontSize=9,
                fontName='Helvetica-Bold',
                spaceBefore=4,
                spaceAfter=4
            )
        )
        elements.append(section_header)

        # Time entries table
        # Headers: DATE | TIME IN | TIME OUT | TIME IN | TIME OUT | TOTAL
        time_header = [
            Paragraph("<b>DATE</b>", self.styles['TableHeader']),
            Paragraph("<b>TIME IN</b>", self.styles['TableHeader']),
            Paragraph("<b>TIME OUT</b>", self.styles['TableHeader']),
            Paragraph("<b>TIME IN</b>", self.styles['TableHeader']),
            Paragraph("<b>TIME OUT</b>", self.styles['TableHeader']),
            Paragraph("<b>TOTAL</b>", self.styles['TableHeader']),
        ]

        time_data = [time_header]

        # Add entries (ensure we have 7+ rows for the week)
        for entry in entries:
            entry_date = entry.get('date')
            if isinstance(entry_date, str):
                from datetime import datetime
                entry_date = datetime.strptime(entry_date, '%Y-%m-%d').date()

            # First shift: start_time to lunch_out
            # Second shift: lunch_in to end_time
            time_in_1 = self._format_time(entry.get('start_time'))
            time_out_1 = self._format_time(entry.get('lunch_out'))
            time_in_2 = self._format_time(entry.get('lunch_in'))
            time_out_2 = self._format_time(entry.get('end_time'))

            hours = entry.get('hours', 0)
            hours_str = f"{hours:.1f}" if hours > 0 else ""

            row = [
                self._format_date_short(entry_date) if entry_date else "",
                time_in_1,
                time_out_1,
                time_in_2,
                time_out_2,
                hours_str,
            ]
            time_data.append(row)

        # Add empty rows to reach at least 10 rows total
        while len(time_data) < 11:
            time_data.append(["", "", "", "", "", ""])

        # Add total row
        time_data.append([
            "", "", "", "", Paragraph("<b>TOTAL:</b>", self.styles['TableHeader']),
            f"{total_hours:.1f}"
        ])

        time_table = Table(
            time_data,
            colWidths=[1.2*inch, 1.15*inch, 1.15*inch, 1.15*inch, 1.15*inch, 0.9*inch]
        )
        time_table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), HEADER_BLUE),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),

            # Data rows
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),

            # Total row
            ('FONTNAME', (-2, -1), (-1, -1), 'Helvetica-Bold'),
            ('BACKGROUND', (0, -1), (-1, -1), HEADER_BLUE),

            # Borders
            ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),

            # Padding
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(time_table)
        elements.append(Spacer(1, 20))

        # Signature Section
        sig_line = "_" * 30
        date_line = "_" * 25

        # Build signature data
        sig_image_or_line = sig_line
        if signature_base64:
            try:
                if ',' in signature_base64:
                    signature_base64 = signature_base64.split(',')[1]
                sig_bytes = base64.b64decode(signature_base64)
                sig_buffer = BytesIO(sig_bytes)
                sig_image_or_line = Image(sig_buffer, width=2*inch, height=0.5*inch)
            except Exception:
                pass

        sig_date_str = self._format_date(signature_date) if signature_date else date_line

        sig_data = [
            [
                Paragraph("<b>PARTICIPANT SIGNATURE:</b>", self.styles['SignatureLabel']),
                sig_image_or_line,
                Paragraph("<b>DATE:</b>", self.styles['SignatureLabel']),
                sig_date_str
            ],
        ]

        sig_table = Table(sig_data, colWidths=[1.8*inch, 2.5*inch, 0.6*inch, 2*inch])
        sig_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(sig_table)
        elements.append(Spacer(1, 8))

        # Printed name
        printed_name_data = [
            [
                Paragraph("<b>PARTICIPANT PRINTED NAME:</b>", self.styles['SignatureLabel']),
                participant_name
            ],
        ]
        printed_table = Table(printed_name_data, colWidths=[2.2*inch, 4*inch])
        printed_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
            ('LINEBELOW', (1, 0), (1, 0), 0.5, colors.black),
        ]))
        elements.append(printed_table)
        elements.append(Spacer(1, 20))

        # Footer
        footer_text = Paragraph(
            "If you have any difficulty regarding accessibility of this form or any data fields, "
            "contact Vocational Rehabilitation: Vremploymentserviceproviders@vr.fldoe.org<br/>"
            "<i>Stevens Amendment Language | Vocational Rehabilitation | "
            "Florida Department of Education (rehabworks.org)</i>",
            self.styles['Footer']
        )
        elements.append(footer_text)

        # Build PDF
        doc.build(elements)
        return buffer.getvalue()


# Singleton instance
pdf_generator = TimesheetPDFGenerator()
