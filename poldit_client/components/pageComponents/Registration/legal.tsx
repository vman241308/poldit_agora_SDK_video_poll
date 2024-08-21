import {
  Box,
  Text,
  Button,
  Stack,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";

import legalStyles from "_appStyles/docStyles.module.css";

const LegalAgmt = ({ close }: any) => {
  return (
    <ModalContent>
      <ModalCloseButton
        _active={{ outline: "none", bg: "none" }}
        _focus={{ outline: "none", bg: "none" }}
        _hover={{ bg: "gray.200", color: "white" }}
      />
      <ModalBody>
        <Box px={{ base: 6, sm: 14 }} pb="16" pt="6" w="100%">
          <Stack spacing="3">
            <Text fontSize="xx-large" fontWeight="semibold" textAlign="center">
              Beta User Agreement
            </Text>
            <Box>
              <Text fontSize="md" mt="5">
                This Beta Test Agreement (“Agreement”) governs the disclosure of
                information by Poldit, LLC. (“Poldit”, “Company” and “Disclosing
                Party”) to Users (the “Recipient” and “Beta Tester”) and
                Recipient’s use of Company’s beta service offering.
              </Text>
            </Box>
            <ol>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>Scope of this Agreement.</b> The Software Web Application
                accompanying this Agreement as a pre-release copy and all
                affiliated materials, including documentation and information
                (collectively the “Web Application”), is copyrighted. Scope of
                this agreement is the licensing (not selling) of the “Web
                Application” to You, as the ‘user’ (either an individual or an
                entity). Poldit LLC reserves all rights not expressly granted.
                <br />
                <br />
                Please read and agree to the following terms and conditions if
                you wish to be eligible to participate in the Closed Beta
                Testing. However, we do not guarantee that you will be selected
                to participate in the Beta Testing.
                <br />
                <br />
                BY SELECTING THE “ACCEPT” BUTTON, YOU ACKNOWLEDGE THAT: (1) YOU
                ARE 13 YEARS OF AGE OR OLDER, AND IF YOU ARE BETWEEN AGE 13 and
                18, YOU HAVE OBTAINED CONSENT FROM YOUR PARENT OR GUARDIAN; AND
                (2) YOU HAVE READ, UNDERSTOOD, AND ACCEPTED THE TERMS AND
                CONDITIONS OF THIS AGREEMENT.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>Limited License.</b> Subject to the terms and conditions of
                this Agreement, Company grants Recipient a nonexclusive,
                nontransferable, limited license to use the Company Web
                Application for a period designated by the Company for the
                purpose of testing and evaluating the Web Application. You are
                entitled to access, download or install, and operate the Web
                Application solely for the purposes of performing your
                obligations under this Agreement. You may not sell, license, or
                transfer the Web Application, the Service, or reproductions of
                the application to other parties in any way.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>Ownership and Copyright of Software.</b> Title to the Web
                Application and all copies thereof remain with Poldit, LLC
                and/or its suppliers. The Web Application is copyrighted and is
                protected by United States copyright laws and international
                treaty provisions. Licensee will not remove copyright notices
                from the Web Application. Licensee agrees to prevent any
                unauthorized copying of the Web Application. Except as expressly
                provided herein, Poldit LLC does not grant any express or
                implied right to you under Poldit LLC’s patents, copyrights,
                trademarks, or trade secret information.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>Confidentiality.</b> The Recipient agrees that it will at all
                times hold in strict confidence and not disclose Confidential
                Information (as defined below) to any third party except as
                approved in writing by the Company and will use the Confidential
                Information for no purpose other than evaluating the Web
                Application. The Recipient shall only permit access to
                Confidential Information to those having a need to know and who
                have signed confidentiality agreements or are otherwise bound by
                confidentiality obligations at least as restrictive as those
                contained herein. “Confidential Information” includes but is not
                limited to web application functionality, published and
                unpublished computer code, design definitions and
                specifications, flow diagrams and flowcharts, formulas and
                algorithms, system and user documentation, data structures, and
                data compilations, marketing, and sales data, customer lists,
                pending patent applications, information relating to the
                Disclosing Party’s operations, processes, plans or intentions,
                production information, technology, computer code, codebase,
                passwords, branding, logos, application colors, application
                design, credential keys, algorithms for ranking (machine
                learning and human-readable), content moderation, website
                design, website architecture, database structure, reports,
                business and user data, business and operation models, process
                workflows, future ideas and plans discussed, financial
                information, technical specifications, know-how, inventions,
                patents, copyrights, design rights, trade secrets, market
                opportunities, and business affairs.
                <br />
                <br />
                <b>Obligations of Beta Tester.</b> In relation to Confidential
                Information received from the Disclosing Party or from a third
                party on behalf of the Disclosing Party, the Beta Tester agrees
                as follows:
                <ul className={legalStyles.legalListStyle}>
                  <li className="mt-1">
                    to treat the Confidential Information in strict confidence
                    and to use it only for the purposes set out above and not
                    for any other commercial or personal purpose without the
                    express agreement of the Disclosing Party;
                  </li>
                  <li className="mt-2">
                    not to copy or write down any part of the Confidential
                    Information except as is reasonably necessary for the
                    purposes aforesaid Beta Test and in such circumstances, the
                    copies or written documentation shall remain at all times
                    the property of the Disclosing Party;
                  </li>
                  <li className="mt-2">
                    to treat the Confidential Information with the same degree
                    of care and with sufficient protection from unauthorized
                    disclosure as the Recipient uses to maintain its own
                    confidential or proprietary information and in any event not
                    less than reasonable care;
                  </li>
                  <li className="mt-2">
                    to recognize that the Disclosing Party has received and in
                    the future will receive confidential or proprietary
                    information from other third parties subject to a duty on
                    the Disclosing Party's part to maintain the confidentiality
                    of such information and to use it only for certain limited
                    purposes. Recipient agrees to hold all such confidential or
                    proprietary information in the strictest confidence and not
                    to disclose it to any person, firm or corporation or to use
                    it except as necessary in carrying out Recipient’s work as
                    Beta Tester for the Disclosing Party consistent with the
                    Disclosing Party’s agreement with such third party.
                  </li>
                  <li className="mt-2">
                    to hold and maintain the Confidential Information in
                    strictest confidence for the sole and exclusive benefit of
                    the Disclosing Party;
                  </li>
                  <li className="mt-2">
                    to carefully restrict access to Confidential Information as
                    is reasonably required and shall require any such persons
                    given access to sign nondisclosure restrictions at least as
                    protective as those in this Agreement; and
                  </li>
                  <li className="mt-2">
                    if, in the course of my relationship with the Disclosing
                    Party, Beta Tester incorporates into Company’s product,
                    process or machine a Prior Invention owned by Beta Tester,
                    or in which Beta Tester has an interest, the Company is
                    hereby granted and shall have a non-exclusive, royalty-free,
                    irrevocable, perpetual, worldwide license (with the right to
                    sublicense) to make, have made, copy, modify, make
                    derivative works of, use, sell and otherwise distribute such
                    Prior Invention as part of or in connection with such
                    product, process or machine.
                  </li>
                </ul>
                <br />
                Beta Tester shall not, without the prior written approval of
                Disclosing Party, use for Beta Tester’s own benefit, publish,
                copy, or otherwise disclose to others in anyway, whether verbal,
                in writing, by fax, by electronic communication, or otherwise,
                or permit the use by others for their benefit or to the
                detriment of Disclosing Party, any Confidential Information. If
                no business relationship between the Disclosing Party and the
                Beta Tester is established, or, if the business relationship
                between the Disclosing Party and the Beta Tester ends or
                otherwise terminates, or if at the request of the Disclosing
                Party at any time, the Beta Tester shall promptly return all
                documents, materials and records and all copies thereof of the
                Confidential Information to the Disclosing Party and destroy any
                and all confidential information including confidential
                information in written form, paper form, printouts, documents,
                manuals, in digital format, stored on all computers, storage
                medium, including cloud services, devices, including personal
                devices, and non-company equipment.
                <br />
                <br />
                The Recipient’s obligations under this Agreement with respect to
                any portion of the Confidential Information shall terminate when
                the Recipient can document that: (a) it was in the public domain
                at the time it was communicated to the Recipient; (b) it entered
                the public domain subsequent to the time it was communicated to
                the Recipient through no fault of the Recipient; (c) it was in
                the Recipient’s possession free of any obligation of confidence
                at the time it was communicated to the Recipient; (d) it was
                rightfully communicated to the Recipient free of any obligation
                of confidence subsequent to the time it was communicated to the
                Recipient; or (e) it was developed by employees or agents of the
                Recipient who had no access to any information communicated to
                the Recipient.
                <br />
                <br />
                After Recipient’s evaluation of the Web Application is complete,
                or upon request of the Company, the Recipient shall promptly
                return to the Company all documents, notes and other tangible
                materials and return or certify the destruction of all
                electronic documents, notes, software, data, and other materials
                in electronic form or non-electronic form representing the
                Confidential Information and all copies thereof.
                <br />
                <br />
                Upon the request of the Disclosing Party, the Beta Tester shall
                certify in writing that all materials containing Confidential
                Information of the Disclosing Party have been returned to
                Disclosing Party or destroyed and no further Confidential
                Information of the Disclosing Party is in the possession or
                control of the Recipient party. Recipient shall provide this
                certification within seven (7) days of the receipt of the
                request.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                The Recipient agrees that nothing contained in this Agreement
                shall be construed as granting any ownership rights to any
                Confidential Information disclosed pursuant to this Agreement,
                or to any invention or any patent, copyright, trademark, or
                other intellectual property right. The Recipient shall not make,
                have made, use or sell for any purpose any product, software,
                application, serfvice, or other item using, incorporating or
                derived from any Confidential Information or the Service. The
                Recipient will not modify, reverse engineer, decompile, create
                other works from, or disassemble any software programs contained
                in the Confidential Information or the Web Application.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>Beta Tester Duties.</b> Beta Tester agrees to report any
                flaws, errors or imperfections discovered in any web
                applications, software or other materials where Beta Tester has
                been granted access to the Beta Test. Beta Tester will also
                respond to and provide responses to any surveys, discussions,
                and/or questionnaires relating to the Beta Test. Beta Tester
                understands that prompt and accurate reporting is the purpose of
                the Beta Tests and undertakes to use best efforts to provide
                frequent reports on all aspects of the web application both
                positive and negative and acknowledges that any improvements,
                modifications, and changes arising from or in connection with
                the Beta Tester’s contribution to the Project, remain or become
                the exclusive property of the Disclosing Party.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>No Support and Maintenance; Future Web Applications.</b>
                During your participation in the Beta Program, Poldit LLC is not
                obligated to provide you with any maintenance, technical or
                other support for the Pre-Release Web Application. You
                acknowledge that Poldit LLC has no express or implied obligation
                to announce or make available a commercial version of the
                Pre-Release Web Application to anyone, including Beta Tester, in
                the future. Should a commercial version be made available, it
                may have features or functionality that are different from those
                found in the Pre-Release Web Application licensed hereunder.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>Term and Termination.</b> Unless otherwise terminated as
                specified under this Agreement. Recipient’s rights with respect
                to the Web Application will terminate upon the earlier of (a)
                the initial commercial release by Poldit, LLC of a generally
                available version of the Web Application or (b) automatic
                expiration of the Web Application based on the system date or
                (c) either party terminates this Agreement at any time for any
                reason or no reason by providing the other party advance written
                notice thereof. Poldit LLC shall immediately terminate this
                Agreement and any Licensee rights with respect to the Web
                Application without notice in the event of improper disclosure
                of Poldit’s Web Application as specified under the
                Confidentiality provisions herein. Upon any expiration or
                termination of this Agreement, the rights and licenses granted
                to Recipient under this Agreement shall immediately terminate,
                and Recipient shall immediately cease using, and will return to
                Poldit LLC (or, at Poldit’s request, destroy), the Web
                Application, documentation, and all other items in Recipient’s
                possession or control that are proprietary to or contain
                Confidential Information. Upon public launch of the site, the
                new terms and conditions will replace this agreement and you
                will be notified to accept the new agreement.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>Privacy.</b> You acknowledge and agree that by participating
                in the Beta Program or by using the Web Application, Poldit LLC
                may receive certain information about you, including personally
                identifiable information, and you hereby consent to Poldit’s
                collection, use and disclosure of such information in accordance
                in order to proceed with the Beta Test.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>Fees and Costs.</b> There are no license fees for Licensee’s
                use of the Beta product under this Agreement. Licensee is
                responsible for all costs and expenses associated with the use
                of the Beta Product and the performance of all testing and
                evaluation activities on their own devices.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>Disclaimer of Warranties.</b> This Service is a beta release
                offering and is not at the level of performance of a
                commercially available product offering. The Service may not
                operate correctly and may be substantially modified prior to
                first commercial release, or at Company’s option may not be
                released commercially in the future. THE SERVICE AND
                DOCUMENTATION ARE PROVIDED “AS IS” WITHOUT WARRANTY OF ANY KIND,
                AND THE COMPANY AND ITS LICENSORS DISCLAIM ALL WARRANTIES,
                EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WITHOUT LIMITATION ANY
                IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT OF THIRD PARTY
                RIGHTS, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE. NO
                ORAL OR WRITTEN ADVICE OR CONSULTATION GIVEN BY THE COMPANY, ITS
                AGENTS OR EMPLOYEES WILL IN ANY WAY GIVE RISE TO A WARRANTY. THE
                ENTIRE RISK ARISING OUT OF THE USE OR PERFORMANCE OF THE SERVICE
                REMAINS WITH THE RECIPIENT.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>LIMITATION OF LIABILITY.</b> COMPANY AND ITS LICENSORS SHALL
                NOT BE LIABLE FOR LOSS OF USE, LOST PROFIT, COST OF COVER, LOSS
                OF DATA, BUSINESS INTERRUPTION, OR ANY INDIRECT, INCIDENTAL,
                CONSEQUENTIAL, PUNITIVE, SPECIAL, OR EXEMPLARY DAMAGES ARISING
                OUT OF OR RELATED TO THE SERVICE OR THIS AGREEMENT, HOWEVER,
                CAUSED AND REGARDLESS OF THE FORM OF ACTION, WHETHER IN
                CONTRACT, TORT (INCLUDING NEGLIGENCE) STRICT LIABILITY, OR
                OTHERWISE, EVEN IF SUCH PARTIES HAVE BEEN ADVISED OF THE
                POSSIBILITY OF SUCH DAMAGES. IN NO EVENT WILL COMPANY’S
                AGGREGATE CUMULATIVE LIABILITY FOR ANY CLAIMS ARISING OUT OF OR
                RELATED TO THIS AGREEMENT EXCEED $50.00 OR THE AMOUNT RECIPIENT
                ACTUALLY PAID THE COMPANY UNDER THIS AGREEMENT (IF ANY)
                WHICHEVER IS LESS.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>Modification.</b> This is the entire agreement between the
                parties relating to the subject matter hereof and all other
                terms are rejected. No waiver or modification of this Agreement
                shall be valid unless in writing signed by each party. The
                waiver of a breach of any term hereof shall in no way be
                construed as a waiver of any term or other breach hereof. If any
                provision of this Agreement is held by a court of competent
                jurisdiction to be contrary to law the remaining provisions of
                this Agreement shall remain in full force and effect.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>No Assignment.</b> This Agreement is personal to Beta Tester.
                Beta Tester shall not assign or otherwise transfer any rights or
                obligations under this Agreement.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>Severability.</b> If any provision of this Agreement shall be
                found by a court to be void, invalid or unenforceable, the same
                shall be reformed to comply with applicable law or stricken if
                not so conformable, so as not to affect the validity or
                enforceability of this Agreement or remaining portions therein.
                If a court finds any provision of this Agreement invalid or
                unenforceable, the remainder of this Agreement shall be
                interpreted so as best to effect the intent of the parties.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>Choice of Law and Disputes; Venue.</b> For other than the
                U.S. Government as a party, this Agreement shall be governed by
                and construed in accordance with the laws of the State of New
                York, as If performed wholly within the state and without giving
                effect to the principles of conflict of law rules of any
                jurisdiction or the United Nations Convention on Contracts for
                the International Sale of Goods, the application of which is
                expressly excluded. Any legal action or proceeding arising under
                this Agreement will be brought exclusively in the federal or
                state courts located in the County of Queens, State of New York,
                and the parties hereby consent to personal jurisdiction and
                venue therein.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>Survivability.</b> The Recipient’s obligations under this
                Agreement shall survive any termination of this agreement. This
                Agreement shall be governed by and construed in accordance with
                the laws of the State of New York. The Recipient hereby agrees
                that breach of this Agreement will cause Company irreparable
                damage for which recovery of damages would be inadequate and
                that the Company shall therefore be entitled to obtain timely
                injunctive relief under this Agreement, as well as such further
                relief as may be granted by a court of competent jurisdiction.
                The Recipient will not assign or transfer any rights or
                obligations under this Agreement without the prior written
                consent of the Company.
              </li>
              <li className="p-2" style={{ fontSize: 14 }}>
                <b>Waiver.</b> No failure or delay by either party in exercising
                any right, power or privilege available to it under this
                Agreement shall be deemed to be a waiver, nor shall any single
                or partial exercise of any such right, power or privilege
                preclude any further exercise or the exercise of any other
                right, power or privilege.
              </li>
            </ol>
          </Stack>
        </Box>
      </ModalBody>
      <ModalFooter>
        <Button variant="solid" colorScheme="gray" onClick={() => close()}>
          Close
        </Button>
      </ModalFooter>
    </ModalContent>
  );
};

export default LegalAgmt;
